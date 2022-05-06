import { makeStyles } from "@material-ui/core";
import { Alert as MuiAlert, AlertTitle } from "@material-ui/lab";

const useStyles = makeStyles({
  alert: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
});

const Alert = ({ title, desc = '', severity = 'info' }) => {
  const classes = useStyles();

  return (
    <MuiAlert className={classes.alert} variant="filled" severity={severity}>
      <AlertTitle>{title}</AlertTitle>
      {desc}
    </MuiAlert>
  );
};

export default Alert;