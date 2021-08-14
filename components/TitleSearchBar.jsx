import { useCallback, useState } from 'react';
import debounce from 'lodash.debounce';
import LruCache from 'lru-cache';
import axios from 'axios';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import {
    TextField,
    CircularProgress,
    makeStyles,
    InputAdornment,
    IconButton,
    alpha
} from '@material-ui/core';
import {
    Movie as MovieIcon,
    Search as SearchIcon,
    Tv as TvIcon
} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
import algoliasearch from 'algoliasearch';

const client = algoliasearch('QVUO52LVSK', 'ae8c0c082adf1cd9dace13ea68322713');
const algolia = client.initIndex('shows');

const useStyles = makeStyles((theme) => ({
    popper: {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        '& .MuiPaper-root': {
            backgroundColor: alpha(theme.palette.background.default, 0.55),
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.18)'
        },
        '& .MuiAutocomplete-option': {
            paddingLeft: 10,
            paddingRight: 10
        }
    },
    groupLabel: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        lineHeight: '35px',
        backdropFilter: 'blur(10px)'
    },
    title: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 0.71
    },
    option: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem'
    },
    optionIcon: {
        flex: 0.15,
        color: theme.palette.text.secondary,
        fontSize: '1.4rem'
    },
    optionYear: {
        flex: 0.14,
        color: theme.palette.text.secondary,
        fontWeight: 500,
        marginLeft: 6
    },
    searchButton: {
        right: 0,
        position: 'absolute'
    },
    searchInput: {
        transition: theme.transitions.create('width'),
        height: 14,
        fontSize: '0.9rem',
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '20ch',
            '&:focus': {
                width: '30ch'
            }
        }
    },
    searchIcon: {
        marginBottom: 5
    },
    loadingIcon: {
        margin: '0px 3px 3px 0px'
    }
}));

const typeToIcon = {
    movie: MovieIcon,
    tv: TvIcon
};

const cache = new LruCache({
   max: 500,
   length: ({ length }) => length
});

function maybeUpdateCache(title, shows) {
    if (!title || cache.has(title)) { return; }

    cache.set(title, shows);
}

async function fetchRatedAndUnratedShows(title) {
    const [ratedShowsResp, unratedShowsResp] = await Promise.all([
        algolia.search(title),
        axios.get(`/api/search?title=${title}`)
    ]);
    const uniqueUnratedShows = unratedShowsResp.data.filter(({ id }) => {
        return -1 === ratedShowsResp.hits.findIndex((ratedShow) => ratedShow.id === id);
    });

    return ratedShowsResp.hits.concat(uniqueUnratedShows);
}

const TitleSearchBar = ({ className, onSubmit }) => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOptions = async (title) => {
        try {
            const shows = await fetchRatedAndUnratedShows(title);

            console.log('shows: ', shows);
            setOptions(shows);
            maybeUpdateCache(title, shows);
        } catch (err) {
            console.error('Unable to find matching show: ', err);
            setOptions([]);
            maybeUpdateCache(title, []);
        }

        setIsLoading(false);
    };

    const fetchOptionsDelayed = useCallback(debounce(fetchOptions, 500), []);

    const updateOptions = (value) => {
        const cachedOptions = cache.get(value);

        if (cachedOptions) {
            setOptions(cachedOptions);
        } else {
            setIsLoading(true);
            fetchOptionsDelayed(value);
        }
    };

    const handleInputChange = async (event, value) => {
        if (value?.length > 1) {
            updateOptions(value);
        } else if (options.length !== 0) {
            setOptions([]);
        }
    };

    const handleSelection = (event, value, reason) => {
        if (reason !== 'select-option') { return; }

        onSubmit(value);
    };

    const buildTitleWithSubstringMatchHighlights = (option, inputValue) => {
        const matches = match(option.title, inputValue);
        const parts = parse(option.title, matches);

        return (
            <div className={classes.title} title={option.title}>
                {parts.map(({ highlight, text }, i) => (
                    <span key={i} style={{ fontWeight: highlight ? 700 : 400 }}>
                        {text}
                    </span>
                ))}
            </div>
        );
    };

    // title returned from alogia has been configured to include <b> tags around matches
    const buildTitleWithAlgoliaFuzzyHighlights = (titleHtml) => (
        <div className={classes.title} dangerouslySetInnerHTML={{ __html: titleHtml }} />
    );

    const renderHighlightedTitle = (option, inputValue) => {
        if (!option.rating) {
            return buildTitleWithSubstringMatchHighlights(option, inputValue);
        }

        return buildTitleWithAlgoliaFuzzyHighlights(option._highlightResult.title.value)
    };

    const renderOption = (option, { inputValue }) => {
        const TypeIcon = typeToIcon[option.type];

        return (
            <div className={classes.option}>
                <TypeIcon size="small" className={classes.optionIcon} />
                {renderHighlightedTitle(option, inputValue)}
                <span className={classes.optionYear}>
                    {option.year}
                </span>
            </div>
        );
    };

    const renderEndAdornment = () => (
        <InputAdornment position="end" className={classes.searchButton}>
            {isLoading && <CircularProgress size={20} className={classes.loadingIcon} />}
            <IconButton
                size="small"
                aria-label="Search for title"
                onClick={() => console.log('search clicked')}
                disabled={options.length === 0}
            >
                <SearchIcon className={classes.searchIcon} />
            </IconButton>
        </InputAdornment>
    );

    const renderInput = (params) => (
        <TextField
            {...params}
            label="Title"
            size="small"
            inputProps={{
                ...params.inputProps,
                className: classes.searchInput
            }}
            InputProps={{
                ...params.InputProps,
                endAdornment: renderEndAdornment()
            }}
        />
    );

    return (
        <Autocomplete
            open={isOpen}
            onOpen={({ target }) => setIsOpen(target.value.length > 1)}
            onClose={() => setIsOpen(false)}
            onInputChange={handleInputChange}
            onChange={handleSelection}
            getOptionSelected={(option, value) => option.imdbId === value.imdbId}
            getOptionLabel={({ title }) => title}
            options={options}
            filterOptions={(options) => options}
            groupBy={({ rating }) => !rating ? 'Unrated' : 'Rated'}
            loading={isLoading}
            renderInput={renderInput}
            renderOption={renderOption}
            classes={{ popper: classes.popper, groupLabel: classes.groupLabel }}
            className={className}
            loadingText="Searching..."
            noOptionsText="No results"
            openOnFocus={false}
            clearOnBlur
        />
    );
}

export default TitleSearchBar;
