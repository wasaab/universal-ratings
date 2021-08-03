import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import LruCache from 'lru-cache';
import { connectAutoComplete, Highlight } from 'react-instantsearch-dom';
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
            width: '18ch',
            '&:focus': {
                width: '25ch'
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
    if (cache.has(title)) { return; }
    
    cache.set(title, shows);
}

const TitleSearch = ({ className, hits = [], currentRefinement, refine }) => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState(hits);
    const [isLoading, setIsLoading] = useState(false);
    const fetchOptionsDelayed = useCallback(debounce(refine, 500), []);

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

    const renderOption = (option, { inputValue }) => {
        const matches = match(option.title, inputValue);
        const parts = parse(option.title, matches);
        const TypeIcon = typeToIcon[option.type];

        return (
            <div className={classes.option}>
                <TypeIcon size="small" className={classes.optionIcon} />
                <Highlight
                    className={classes.title}
                    title={option.title}
                    hit={option}
                    attribute="title"
                    tagName="b"
                />
                <span className={classes.optionYear}>
                    {option.year}
                </span>
            </div>
        );
    };

    const renderSmallInput = (params) => (
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
                endAdornment: (
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
                ),
            }}
        />
    );

    useEffect(() => {
        setIsLoading(false);
        maybeUpdateCache(currentRefinement, hits);
    }, [hits]);
    
    return (
        <Autocomplete
            open={isOpen}
            onOpen={({ target }) => setIsOpen(target.value.length > 1)}
            onClose={() => setIsOpen(false)}
            onInputChange={handleInputChange}
            getOptionSelected={(option, value) => option.title === value.title}
            getOptionLabel={({ title }) => title}
            options={hits}
            filterOptions={(options) => options}
            loading={isLoading}
            renderInput={renderSmallInput}
            renderOption={renderOption}
            classes={{ popper: classes.popper }}
            className={className}
            loadingText="Searching..."
            noOptionsText="No results"
            openOnFocus={false}
            clearOnBlur
        />
    );
}

const TitleSearchBar = connectAutoComplete(TitleSearch);

export default TitleSearchBar;
