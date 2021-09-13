import React, { useMemo, useState } from 'react';
import { Avatar, Box, Button, Dialog, DialogContent, makeStyles, TextField } from '@material-ui/core';
import { SliderPicker } from 'react-color';
import API, { graphqlOperation } from '@aws-amplify/api';
import { updateUser } from '../src/graphql/mutations';

const useStyles = makeStyles((theme) => ({
  content: {
    height: 230,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    [theme.breakpoints.up(365)]: {
      width: 300
    }
  },
  avatar: {
    width: 40,
    height: 40,
    color: theme.palette.text.primary
  },
  slider: {
    flex: 0.8,
    paddingBottom: 5
  },
  saveButton: {
    marginBottom: 4
  }
}));

const UserProfileModal = ({ user, onClose, onSave }) => {
  const classes = useStyles();
  const [color, setColor] = useState(user.color);
  const [name, setName] = useState(user.name);
  const isNameValid = useMemo(() => name && name.length < 35, [name]);

  const handleColorChange = (updatedColor) => {
    setColor(updatedColor.hex);
  };

  const saveChanges = async () => {
    const updatedUser = {
      id: user.id,
      name,
      color
    };

    try {
      await API.graphql(graphqlOperation(updateUser, { input: updatedUser }));
      onSave(name, color);
    } catch (err) {
      console.error('Failed to update user: ', err);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogContent className={classes.content}>
        <TextField
          label="Name"
          error={!isNameValid}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setName(name.trim())}
        />
        <Box display="flex" justifyContent="space-between">
          <Avatar className={classes.avatar} style={{ backgroundColor: color }}>
            {name ? name.match(/^(\p{Extended_Pictographic}|.)/u)[0].toUpperCase() : ''}
          </Avatar>
          <SliderPicker color={color} onChangeComplete={handleColorChange} className={classes.slider} />
        </Box>
        <Button
          disabled={!isNameValid || (color === user.color && name === user.name)}
          variant="outlined"
          color="secondary"
          onClick={saveChanges}
          className={classes.saveButton}
        >
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;