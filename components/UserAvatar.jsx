import { Avatar, makeStyles, Tooltip } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  avatar: ({ color, backgroundColor, size }) => ({
    width: size,
    height: size,
    color: color ?? theme.palette.text.primary,
    backgroundColor: backgroundColor ?? theme.palette.common.white,
  })
}));

const UserAvatar = ({ name, color, backgroundColor, size, tooltip }) => {
  const classes = useStyles({ color, backgroundColor, size });

  return (
    <Tooltip title={tooltip ? name : ''}>
      <Avatar className={classes.avatar}>
        {name ? name.match(/^(\p{Extended_Pictographic}|.)/u)[0].toUpperCase() : ''}
      </Avatar>
    </Tooltip>
  );
};

export default UserAvatar;