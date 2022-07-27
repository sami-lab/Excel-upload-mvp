import { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import axios from '../Helper/axios';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontWeight: '600',
  },
  button: {
    fontWeight: '600',
  },
  container: {
    padding: '0',
    margin: '30px 0',
  },
  circleIcon: {
    fontSize: 50,
    display: 'block',
    cursor: 'pointer',
    margin: '10px 0',
  },
}));

export default function Main() {
  const classes = useStyles();

  const fetchList = async () => {
    axios
      .get(
        'https://google-sheets-ninja-api.herokuapp.com/sheet/1fx8DTeZvBC-f96sSvwLDhsaKqoRNHjCRtsgQaisJegM/CalendarView!A1:C'
      )
      .then((result) => console.log(result));
  };

  useEffect(() => {
    //fetchList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <></>;
}
