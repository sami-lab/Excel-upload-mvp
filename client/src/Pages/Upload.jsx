import React, { useState } from 'react';

import { Grid, Typography, Button } from '@material-ui/core';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import axios from '../Helper/axios';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '90vh',
    padding: '1em',
  },
  title: {
    fontFamily: 'Montserrat',
    color: '#051E38',
    fontWeight: 900,
    fontSize: 55,
    [theme.breakpoints.down('sm')]: {
      fontSize: 45,
    },
  },
  titleText: {
    fontFamily: 'Montserrat',
    fontWeight: 700,
    fontSize: '16px',
    color: '#051E38',
    lineHeight: '1.5em',
    transition:
      'background .3s,border .3s,border-radius .3s,box-shadow .3s,-webkit-border-radius .3s,-webkit-box-shadow .3s',
  },
  firstButton: {
    textTransform: 'capitalize',
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontWeight: 700,
    fill: '#f8f6f6',
    color: '#f8f6f6',
    transitionDuration: '.3s',
    transitionProperty: 'transform',
    backgroundColor: theme.palette.primary.blue,
    borderRadius: '50px 50px 50px 50px',
    padding: '10px 20px 10px 20px',
    '&:hover': {
      transform: 'scale(1.1)',
      backgroundColor: theme.palette.primary.blue,
    },
    // desktop
    [theme.breakpoints.up('sm')]: {
      textTransform: 'capitalize',
      fontFamily: 'Montserrat',
      fontSize: '16px',
      fontWeight: 700,
      fill: '#f8f6f6',
      color: '#f8f6f6',
      transitionDuration: '.3s',
      transitionProperty: 'transform',
      borderRadius: '50px 50px 50px 50px',
      padding: '11px 35px 11px 35px',
    },
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  icons: {
    margin: '0 0.4em',
  },
  copyRightText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#7a7a7a',
    fontFamily: 'Montserrat',
    padding: '1em 0',
    [theme.breakpoints.up('sm')]: {
      padding: '0 0',
    },
  },
}));

export default function Upload() {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const fileUploadHandler = async (e) => {
    if (!e.target.files || e.target.files[0]) {
      setError('No file Selected');
      return;
    }
    try {
      setLoading(true);
      let formData = new FormData();

      formData.append('file', e.target.files[0]);
      const response = await axios.post(`/files/`, formData);
      if (response.data.status === 'success') {
      } else {
        setError(response.data.message);
      }
      setLoading(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(true);
    }
  };
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      className={classes.root}
    >
      <Grid item style={{ marginTop: '1em' }}>
        <Typography variant="h1" style={{ textAlign: 'center' }} className={classes.title}>
          Upload Your file
        </Typography>
      </Grid>
      <Grid item style={{ marginTop: '1em' }}>
        <Typography variant="h4" style={{ textAlign: 'center' }} className={classes.titleText}>
          Upload your excel file to display on main page
        </Typography>
      </Grid>

      <input
        type={'file'}
        id="icon-button-file"
        onChange={fileUploadHandler}
        style={{ display: 'none' }}
      />
      <Grid item style={{ marginTop: '1em' }}>
        <label htmlFor="icon-button-file">
          <Button variant="outlined">Upload</Button>
        </label>
      </Grid>
    </Grid>
  );
}
