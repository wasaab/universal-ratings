import React, { useEffect, useState, useRef} from 'react';
import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { showsByDate } from '../src/graphql/queries';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Movie as MovieIcon,
  Tv as TvIcon,
  NewReleases as NewReleasesIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  WatchLater as WatchLaterIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon
} from '@material-ui/icons/'
import ShowCard from './ShowCard';
import TitleSearchBar from './TitleSearchBar';
import ShowDetailsModal from './ShowDetailsModal';
import useOnScreen from './useOnScreen';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  appBar: ({ open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    marginLeft: open ? drawerWidth : 0,
    width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }),
  menuButton: {
    marginRight: 36
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: theme.spacing(7)
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  },
  searchBar: {
    position: 'absolute',
    right: 24
  }
}));

function determineAvgRating(reviews) {
  return reviews.reduce((sum, { rating }) => sum + rating, 0) / reviews.length;
}

const SideMenuItem = ({ title, LeftIcon, onClick }) => (
  <ListItem button key={title} onClick={onClick}>
    <ListItemIcon>
      <LeftIcon />
    </ListItemIcon>

    <ListItemText primary={title} />
  </ListItem>
);

const SideMenuToolbar = () => {
  const [open, setOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState();
  const [selectedShowIdx, setSelectedShowIdx] = useState();
  const [shows, setShows] = useState([]);
  const [userId, setUserId] = useState();
  const [nextToken, setNextToken] = useState();
  const endOfPageRef = useRef();
  const isEndOfPageVisisble = useOnScreen(endOfPageRef);
  const classes = useStyles({ open });

  const fetchShows = async () => {
    try {
      const queryParams = {
        limit: 100,
        sortDirection: 'DESC',
        type: 'tv',
        nextToken
      };

      const { data } = await API.graphql(graphqlOperation(showsByDate, queryParams));
      const filteredShows = data.showsByDate.items.filter(({ img }) => img); // Todo: Temp until shows w/o images are handled or img is made a required field

      // Todo: add logic for updating show's avg rating in db when reviews are updated, rather than calculating client-side.
      filteredShows.forEach((show) => {
        show.rating = determineAvgRating(show.reviews.items);
      });
      console.log('filteredShows: ', filteredShows);
      setShows([...shows, ...filteredShows]);
      setNextToken(data.showsByDate.nextToken);
    } catch(err) {
      console.error('Failed to list shows: ', err);
    }
  };

  useEffect(() => {
    if (!isEndOfPageVisisble || !nextToken) { return; }

    fetchShows();
  }, [isEndOfPageVisisble]);

  const storeUserId = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();

      setUserId(user.attributes.sub);
    } catch (err) {
      console.error('Failed to get authed user: ', err);
    }
  }

  useEffect(async () => {
   fetchShows();
   storeUserId();
  }, []);

  const handleDrawerOpen = () => {
    console.log('opened');
    setOpen(true);
  };

  const handleDrawerClose = () => {
    console.log('closed');
    setOpen(false);
  };

  const renderDrawer = () => {
    const drawerStateClass = open ? classes.drawerOpen : classes.drawerClose;

    return (
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, drawerStateClass)}
        classes={{ paper: drawerStateClass }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>

        <Divider />

        <List>
          <SideMenuItem title="Home" LeftIcon={HomeIcon} />
          <SideMenuItem title="Movies" LeftIcon={MovieIcon} />
          <SideMenuItem title="TV Shows" LeftIcon={TvIcon} />
          <SideMenuItem title="Recently Released" LeftIcon={NewReleasesIcon} />
          <SideMenuItem title="Recently Rated" LeftIcon={StarIcon} />
        </List>

        <Divider />

        <List>
          <SideMenuItem title="Favorites" LeftIcon={FavoriteIcon} />
          <SideMenuItem title="Watchlist" LeftIcon={WatchLaterIcon} />
          <SideMenuItem title="Watched" LeftIcon={VisibilityIcon} />
        </List>
      </Drawer>
    );
  }

  const updateReviews = (reviews, review) => {
    const oldReview = reviews.find((review) => review.userId === userId);

    if (oldReview) {
      oldReview.rating = review.rating;
    } else {
      reviews.push(review);
    }
  };

  const updateRating = (review, showIdx = selectedShowIdx) => {
    if (isNaN(showIdx)) {
      // Todo: This is here for when user got into modal via search and rated an existing show. implement real logic.
      showIdx = shows.findIndex(({ id }) => id === selectedShow.id);

      if (showIdx === -1) { return; }

      setSelectedShowIdx(showIdx);
    }

    const updatedShows = [...shows];
    const show = updatedShows[showIdx];
    const reviews = show.reviews.items;

    updateReviews(reviews, review);

    const avgRating = determineAvgRating(reviews);

    show.rating = avgRating;
    setShows(updatedShows);

    if (!selectedShow) { return; }

    setSelectedShow(show);
  };

  const addShow = (show) => {
    setSelectedShowIdx(shows.length);
    setSelectedShow(show);
    setShows([...shows, show]);
  };

  const unselectShow = () => {
    setSelectedShow(null);
    setSelectedShowIdx(null);
  };

  const selectShow = (show, showIdx) => {
    setSelectedShow(show);
    setSelectedShowIdx(showIdx);
  };

  const findUserReview = (reviews) => reviews?.find((review) => review.userId === userId);

  const renderShowCardGrid = () => (
    <Grid container spacing={3}  wrap="wrap">
      {shows.map((show, i) => (
        <Grid key={i} item xs>
          <ShowCard
            show={show}
            userRating={findUserReview(show.reviews?.items)?.rating}
            onRatingChange={(review) => updateRating({ ...review, userId }, i)} // Todo: This needs to call graphql endpoint otherwise change isn't persisted
            onClick={() => selectShow(show, i)}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className={classes.menuButton}
              onClick={handleDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            Universal Ratings
          </Typography>
          <TitleSearchBar className={classes.searchBar} onSubmit={setSelectedShow} />
        </Toolbar>
      </AppBar>

      {renderDrawer()}

      <main className={classes.content}>
        <span className={classes.toolbar} />
        {selectedShow && (
          <ShowDetailsModal
            show={selectedShow}
            userId={userId}
            userRating={findUserReview(selectedShow.reviews?.items)?.rating}
            onRatingChange={updateRating}
            onShowAdded={addShow}
            onClose={unselectShow}
          />
        )}
        {renderShowCardGrid()}
        <div ref={endOfPageRef} style={{ position: 'relative', bottom: 500 }} />
      </main>
    </div>
  );
};

export default SideMenuToolbar;
