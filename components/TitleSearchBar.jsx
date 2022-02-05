import { useCallback, useState } from 'react';
import debounce from 'lodash.debounce';
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
import { searchClient, StaleQueryError } from '../src/client';
import algoliaLogoUrl from '../resources/images/algolia.svg';

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
        opacity: 0.8,
        content: `url("${algoliaLogoUrl}")`,
        display: 'flex',
        justifyContent: 'right',
        marginRight: 19,
      }
    },
    '& .MuiAutocomplete-option': {
      paddingLeft: 10,
      paddingRight: 10,
      '&[data-focus="true"]': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      }
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

const TitleSearchBar = ({ className, onSubmit }) => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOptions = async (title) => {
    try {
      const shows = await searchClient.fetchShows(title);

      console.log(`show options for "${title}": `, shows);
      setOptions(shows);
    } catch (err) {
      if (axios.isCancel(err) || err instanceof StaleQueryError) { return; }

      console.error('Unable to find matching show: ', err);
      setOptions([]);
      searchClient.maybeUpdateCache(title, []);
    }

    setIsLoading(false);
  };

  const fetchOptionsDelayed = useCallback(debounce(fetchOptions, 500), []);

  const cancelSearch = () => {
    searchClient.cancelShowsRequest();
    setIsLoading(false);
  };

  const updateOptions = (title) => {
    const cachedOptions = searchClient.cache.get(title);

    searchClient.query = title;

    if (cachedOptions) {
      setOptions(cachedOptions);

      if (isLoading) {
        cancelSearch();
      }
    } else {
      setIsLoading(true);
      fetchOptionsDelayed(title);
    }
  };

  const clear = () => {
    setIsOpen(false);
    setOptions([]);

    if (isLoading) {
      searchClient.query = null;
      cancelSearch();
    }
  };

  const handleInputChange = (event, value) => {
    const title = value?.trim();

    if (title?.length > 1) {
      updateOptions(title);
    } else if (options.length !== 0 || isLoading) {
      clear();
    }
  };

  const handleSelection = (event, value, reason) => {
    if (reason !== 'select-option') { return; }

    onSubmit(value);
  };

  const isOptionSelected = (option, selected) => (
    option.id ? option.id === selected.id : option.tmdbId === selected.tmdbId
  );

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

    return buildTitleWithAlgoliaFuzzyHighlights(option._highlightResult.title.value);
  };

  const renderOption = (option, { inputValue }) => {
    const TypeIcon = typeToIcon[option.type];

    return (
      <div className={classes.option}>
        <TypeIcon size="small" className={classes.optionIcon} />
        {renderHighlightedTitle(option, inputValue.trim())}
        <span className={classes.optionYear}>
          {option.releaseDate.slice(0, 4)}
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
        onClick={() => onSubmit(options[0])}
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
      onOpen={({ target }) => setIsOpen(target.value.trim().length > 1)}
      onClose={() => setIsOpen(false)}
      onInputChange={handleInputChange}
      onChange={handleSelection}
      getOptionSelected={isOptionSelected}
      getOptionLabel={() => ''} // clears & focuses input on selection
      value={null} // prevents selected option persistence after blur
      options={options}
      filterOptions={(unfilteredOptions) => unfilteredOptions}
      groupBy={({ source }) => (source === 'UR' ? 'Rated' : 'Unrated')}
      loading={isLoading}
      renderInput={renderInput}
      renderOption={renderOption}
      classes={{ popper: classes.popper, groupLabel: classes.groupLabel }}
      className={className}
      loadingText="Searching..."
      noOptionsText="No results"
      openOnFocus={false}
      autoHighlight
      clearOnBlur
    />
  );
};

export default TitleSearchBar;