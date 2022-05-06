import { Grid, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    alignItems: 'center',
    display: 'flex'
  },
  label: {
    fontSize: 17,
    fontWeight: 500,
    padding: '1px 0px 0px 8px',
  }
});

const LabelledIcon = ({ Icon, label }) => {
  const classes = useStyles();

  return (
    <Grid item xs className={classes.root}>
      <Icon height="24" />
      <Typography variant="caption" color="textSecondary" className={classes.label}>
        {label}
      </Typography>
    </Grid>
  );
};

export default LabelledIcon;