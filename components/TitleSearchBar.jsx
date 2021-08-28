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
const algolia = client.initIndex('show');

const useStyles = makeStyles((theme) => ({
    popper: {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        '& .MuiPaper-root': {
            backgroundColor: alpha(theme.palette.background.default, 0.55),
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.18)',
            '&:after': {
                marginLeft: 101,
                opacity: 0.8,
                content: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='168' height='24'%3E%3Cg fill='none'%3E%3Cpath fill='%23FFF' d='M120.925 18.804c-4.386.02-4.386-3.54-4.386-4.106l-.007-13.336 2.675-.424v13.254c0 .322 0 2.358 1.718 2.364v2.248zm-10.846-2.18c.821 0 1.43-.047 1.855-.129v-2.719a6.334 6.334 0 00-1.574-.199 5.7 5.7 0 00-.897.069 2.699 2.699 0 00-.814.24c-.24.116-.439.28-.582.491-.15.212-.219.335-.219.656 0 .628.219.991.616 1.23s.938.362 1.615.362zm-.233-9.7c.883 0 1.629.109 2.231.328.602.218 1.088.525 1.444.915.363.396.609.922.76 1.483.157.56.232 1.175.232 1.85v6.874a32.5 32.5 0 01-1.868.314c-.834.123-1.772.185-2.813.185-.69 0-1.327-.069-1.895-.198a4.001 4.001 0 01-1.471-.636 3.085 3.085 0 01-.951-1.134c-.226-.465-.343-1.12-.343-1.803 0-.656.13-1.073.384-1.525a3.24 3.24 0 011.047-1.106c.445-.287.95-.492 1.532-.615a8.8 8.8 0 011.82-.185 8.404 8.404 0 011.972.24v-.438c0-.307-.035-.6-.11-.874a1.88 1.88 0 00-.384-.73 1.784 1.784 0 00-.724-.493 3.164 3.164 0 00-1.143-.205c-.616 0-1.177.075-1.69.164a7.735 7.735 0 00-1.26.307l-.321-2.192c.335-.117.834-.233 1.478-.349a10.98 10.98 0 012.073-.178zm52.842 9.626c.822 0 1.43-.048 1.854-.13V13.7a6.347 6.347 0 00-1.574-.199c-.294 0-.595.021-.896.069a2.7 2.7 0 00-.814.24 1.46 1.46 0 00-.582.491c-.15.212-.218.335-.218.656 0 .628.218.991.615 1.23.404.245.938.362 1.615.362zm-.226-9.694c.883 0 1.629.108 2.231.327.602.219 1.088.526 1.444.915.355.39.609.923.759 1.483a6.8 6.8 0 01.233 1.852v6.873c-.41.088-1.034.19-1.868.314-.834.123-1.772.184-2.813.184-.69 0-1.327-.068-1.895-.198a4.001 4.001 0 01-1.471-.635 3.085 3.085 0 01-.951-1.134c-.226-.465-.343-1.12-.343-1.804 0-.656.13-1.073.384-1.524.26-.45.608-.82 1.047-1.107.445-.286.95-.491 1.532-.614a8.803 8.803 0 012.751-.13c.329.034.671.096 1.04.185v-.437a3.3 3.3 0 00-.109-.875 1.873 1.873 0 00-.384-.731 1.784 1.784 0 00-.724-.492 3.165 3.165 0 00-1.143-.205c-.616 0-1.177.075-1.69.164a7.75 7.75 0 00-1.26.307l-.321-2.193c.335-.116.834-.232 1.478-.348a11.633 11.633 0 012.073-.177zm-8.034-1.271a1.626 1.626 0 01-1.628-1.62c0-.895.725-1.62 1.628-1.62.904 0 1.63.725 1.63 1.62 0 .895-.733 1.62-1.63 1.62zm1.348 13.22h-2.689V7.27l2.69-.423v11.956zm-4.714 0c-4.386.02-4.386-3.54-4.386-4.107l-.008-13.336 2.676-.424v13.254c0 .322 0 2.358 1.718 2.364v2.248zm-8.698-5.903c0-1.156-.253-2.119-.746-2.788-.493-.677-1.183-1.01-2.067-1.01-.882 0-1.574.333-2.065 1.01-.493.676-.733 1.632-.733 2.788 0 1.168.246 1.953.74 2.63.492.683 1.183 1.018 2.066 1.018.882 0 1.574-.342 2.067-1.019.492-.683.738-1.46.738-2.63zm2.737-.007c0 .902-.13 1.584-.397 2.33a5.52 5.52 0 01-1.128 1.906 4.986 4.986 0 01-1.752 1.223c-.685.286-1.739.45-2.265.45-.528-.006-1.574-.157-2.252-.45a5.096 5.096 0 01-1.744-1.223c-.487-.527-.863-1.162-1.137-1.906a6.345 6.345 0 01-.41-2.33c0-.902.123-1.77.397-2.508a5.554 5.554 0 011.15-1.892 5.133 5.133 0 011.75-1.216c.679-.287 1.425-.423 2.232-.423.808 0 1.553.142 2.237.423a4.88 4.88 0 011.753 1.216 5.644 5.644 0 011.135 1.892c.287.738.431 1.606.431 2.508zm-20.138 0c0 1.12.246 2.363.738 2.882.493.52 1.13.78 1.91.78.424 0 .828-.062 1.204-.178.377-.116.677-.253.917-.417V9.33a10.476 10.476 0 00-1.766-.226c-.971-.028-1.71.37-2.23 1.004-.513.636-.773 1.75-.773 2.788zm7.438 5.274c0 1.824-.466 3.156-1.404 4.004-.936.846-2.367 1.27-4.296 1.27-.705 0-2.17-.137-3.34-.396l.431-2.118c.98.205 2.272.26 2.95.26 1.074 0 1.84-.219 2.299-.656.459-.437.684-1.086.684-1.948v-.437a8.07 8.07 0 01-1.047.397c-.43.13-.93.198-1.492.198-.739 0-1.41-.116-2.018-.349a4.206 4.206 0 01-1.567-1.025c-.431-.45-.774-1.017-1.013-1.694-.24-.677-.363-1.885-.363-2.773 0-.834.13-1.88.384-2.577.26-.696.629-1.298 1.129-1.796.493-.498 1.095-.881 1.8-1.162a6.605 6.605 0 012.428-.457c.87 0 1.67.109 2.45.24.78.129 1.444.265 1.985.415V18.17zM6.972 6.677v1.627c-.712-.446-1.52-.67-2.425-.67-.585 0-1.045.13-1.38.391a1.24 1.24 0 00-.502 1.03c0 .425.164.765.494 1.02.33.256.835.532 1.516.83.447.192.795.356 1.045.495.25.138.537.332.862.582.324.25.563.548.718.894.154.345.23.741.23 1.188 0 .947-.334 1.691-1.004 2.234-.67.542-1.537.814-2.601.814-1.18 0-2.16-.229-2.936-.686v-1.708c.84.628 1.814.942 2.92.942.585 0 1.048-.136 1.388-.407.34-.271.51-.646.51-1.125 0-.287-.1-.55-.302-.79-.203-.24-.42-.42-.655-.542-.234-.123-.585-.29-1.053-.503a61.27 61.27 0 01-.582-.271 13.67 13.67 0 01-.55-.287 4.275 4.275 0 01-.567-.351 6.92 6.92 0 01-.455-.4c-.18-.17-.31-.34-.39-.51-.08-.17-.155-.37-.224-.598a2.553 2.553 0 01-.104-.742c0-.915.333-1.638.998-2.17.664-.532 1.523-.798 2.576-.798.968 0 1.793.17 2.473.51zm7.468 5.696v-.287c-.022-.607-.187-1.088-.495-1.444-.309-.357-.75-.535-1.324-.535-.532 0-.99.194-1.373.583-.382.388-.622.949-.717 1.683h3.909zm1.005 2.792v1.404c-.596.34-1.383.51-2.362.51-1.255 0-2.255-.377-3-1.132-.744-.755-1.116-1.744-1.116-2.968 0-1.297.34-2.316 1.021-3.055.68-.74 1.548-1.11 2.6-1.11 1.033 0 1.852.323 2.458.966.606.644.91 1.572.91 2.784 0 .33-.033.676-.096 1.038h-5.314c.107.702.405 1.239.894 1.611.49.372 1.106.558 1.85.558.862 0 1.58-.202 2.155-.606zm6.605-1.77h-1.212c-.596 0-1.045.116-1.349.35-.303.234-.454.532-.454.894 0 .372.117.664.35.877.235.213.575.32 1.022.32.51 0 .912-.142 1.204-.424.293-.281.44-.651.44-1.108v-.91zm-4.068-2.554V9.325c.627-.361 1.457-.542 2.489-.542 2.116 0 3.175 1.026 3.175 3.08V17h-1.548v-.957c-.415.68-1.143 1.02-2.186 1.02-.766 0-1.38-.22-1.843-.661-.462-.442-.694-1.003-.694-1.684 0-.776.293-1.38.878-1.81.585-.431 1.404-.647 2.457-.647h1.34V11.8c0-.554-.133-.971-.399-1.253-.266-.282-.707-.423-1.324-.423a4.07 4.07 0 00-2.345.718zm9.333-1.93v1.42c.394-1 1.101-1.5 2.123-1.5.148 0 .313.016.494.048v1.531a1.885 1.885 0 00-.75-.143c-.542 0-.989.24-1.34.718-.351.479-.527 1.048-.527 1.707V17h-1.563V8.91h1.563zm5.01 4.084c.022.82.272 1.492.75 2.019.479.526 1.15.79 2.01.79.639 0 1.235-.176 1.788-.527v1.404c-.521.319-1.186.479-1.995.479-1.265 0-2.276-.4-3.031-1.197-.755-.798-1.133-1.792-1.133-2.984 0-1.16.38-2.151 1.14-2.975.761-.825 1.79-1.237 3.088-1.237.702 0 1.346.149 1.93.447v1.436a3.242 3.242 0 00-1.77-.495c-.84 0-1.513.266-2.019.798-.505.532-.758 1.213-.758 2.042zM40.24 5.72v4.579c.458-1 1.293-1.5 2.505-1.5.787 0 1.42.245 1.899.734.479.49.718 1.17.718 2.042V17h-1.564v-5.106c0-.553-.14-.98-.422-1.284-.282-.303-.652-.455-1.11-.455-.531 0-1.002.202-1.411.606-.41.405-.615 1.022-.615 1.851V17h-1.563V5.72h1.563zm14.966 10.02c.596 0 1.096-.253 1.5-.758.404-.506.606-1.157.606-1.955 0-.915-.202-1.62-.606-2.114-.404-.495-.92-.742-1.548-.742-.553 0-1.05.224-1.491.67-.442.447-.662 1.133-.662 2.058 0 .958.212 1.67.638 2.138.425.469.946.703 1.563.703zM53.004 5.72v4.42c.574-.894 1.388-1.341 2.44-1.341 1.022 0 1.857.383 2.506 1.149.649.766.973 1.781.973 3.047 0 1.138-.309 2.109-.925 2.912-.617.803-1.463 1.205-2.537 1.205-1.075 0-1.894-.447-2.457-1.34V17h-1.58V5.72h1.58zm9.908 11.104l-3.223-7.913h1.739l1.005 2.632 1.26 3.415c.096-.32.48-1.458 1.15-3.415l.909-2.632h1.66l-2.92 7.866c-.777 2.074-1.963 3.11-3.559 3.11a2.92 2.92 0 01-.734-.079v-1.34c.17.042.351.064.543.064 1.032 0 1.755-.57 2.17-1.708z'/%3E%3Cpath fill='%235468FF' d='M78.988.938h16.594a2.968 2.968 0 012.966 2.966V20.5a2.967 2.967 0 01-2.966 2.964H78.988a2.967 2.967 0 01-2.966-2.964V3.897A2.961 2.961 0 0178.988.938z'/%3E%3Cpath fill='%23FFF' d='M89.632 5.967v-.772a.978.978 0 00-.978-.977h-2.28a.978.978 0 00-.978.977v.793c0 .088.082.15.171.13a7.127 7.127 0 011.984-.28c.65 0 1.295.088 1.917.259.082.02.164-.04.164-.13m-6.248 1.01l-.39-.389a.977.977 0 00-1.382 0l-.465.465a.973.973 0 000 1.38l.383.383c.062.061.15.047.205-.014.226-.307.472-.601.746-.874.281-.28.568-.526.883-.751.068-.042.075-.137.02-.2m4.16 2.453v3.341c0 .096.104.165.192.117l2.97-1.537c.068-.034.089-.117.055-.184a3.695 3.695 0 00-3.08-1.866c-.068 0-.136.054-.136.13m0 8.048a4.489 4.489 0 01-4.49-4.482 4.488 4.488 0 014.49-4.482 4.488 4.488 0 014.489 4.482 4.484 4.484 0 01-4.49 4.482m0-10.85a6.363 6.363 0 100 12.729 6.37 6.37 0 006.372-6.368 6.358 6.358 0 00-6.371-6.36'/%3E%3C/g%3E%3C/svg%3E\")"
            }
        },
        '& .MuiAutocomplete-option': {
            paddingLeft: 10,
            paddingRight: 10
        },
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
        return -1 === ratedShowsResp.hits.findIndex(({ objectID }) => objectID === id);
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
        if (option.id) {
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
            getOptionSelected={(option, value) => option.id === value.id || option.objectID === value.objectID}
            getOptionLabel={() => ''} // clears & focuses input on selection
            options={options}
            filterOptions={(options) => options}
            groupBy={({ id }) => id ? 'Unrated' : 'Rated'}
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
