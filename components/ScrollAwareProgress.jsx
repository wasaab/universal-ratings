import React, { useEffect, useRef } from 'react';
import { Backdrop, Box, CircularProgress, LinearProgress, makeStyles } from '@material-ui/core';
import { useOnScreen } from '../hooks';
import { Loading } from '../src/model';

const useStyles = makeStyles({
  progressRoot: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.27)',
    borderRadius: 4
  },
  progressBar: {
    borderRadius: 4
  },
  loadingBackdrop: {
    zIndex: 1
  }
});

const ScrollAwareProgress = ({ loadingType, backdropLeftStyle, onEndOfPageReached }) => {
  const classes = useStyles();
  const endOfPageRef = useRef();
  const [isEndOfPageVisisble] = useOnScreen(endOfPageRef);

  useEffect(() => {
    if (!isEndOfPageVisisble) { return; }

    onEndOfPageReached();
  }, [isEndOfPageVisisble]);

  return (
    <>
      {loadingType === Loading.PAGE && isEndOfPageVisisble && (
        <Box display="flex" justifyContent="center" mt="24px" width="100%">
          <LinearProgress classes={{ root: classes.progressRoot, bar: classes.progressBar}} />
        </Box>
      )}

      <Backdrop
        style={{ left: backdropLeftStyle }}
        className={classes.loadingBackdrop}
        transitionDuration={{ exit: 500 }}
        open={loadingType === Loading.VIEW}
      >
        <CircularProgress disableShrink size={50} />
      </Backdrop>

      <div ref={endOfPageRef} style={{ position: 'relative', bottom: 500 }} />
    </>
  );
};

export default ScrollAwareProgress;