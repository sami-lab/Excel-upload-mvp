import { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import axios from '../Helper/axios';
import Loading from '../Helper/loading';
import Error from '../Helper/error';

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

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState({
    active: false,
    action: '',
  });
  const [error, setError] = useState({
    active: false,
    action: '',
    message: '',
  });
  const fetchList = async () => {
    try {
      setLoading({
        active: true,
        action: 'page',
      });
      const response = await axios.get('/files/lastWeekRecords');
      if (response.data.status === 'success') {
        setFiles(response.data.data.doc);
      } else {
        setError({
          active: true,
          action: 'page',
          message: response.data.message,
        });
      }
      setLoading({
        active: false,
        action: '',
      });
    } catch (err) {
      setLoading({
        active: false,
        action: '',
      });
      setError({
        active: true,
        action: 'page',
        message: err.response?.data?.message || 'Something went wrong',
      });
    }
  };

  useEffect(() => {
    fetchList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (loading.active && loading.action === 'page') {
    return <Loading />;
  }
  if (error.active && error.action === 'page') {
    return <Error message={error.message} />;
  }
  return (
    <>
      {files.map((f) => (
        <div key={f.file}>
          {/* <iframe
            style={{ width: '98vw', height: '100vw' }}
            src={process.env.REACT_APP_API_URL + '/files/' + f.file}
            //src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRYLvmgQNaKbs35iOjZFBHK4LjDxgH3h87BbTkJoXh-VGy7aR7rE8MG6gfZBJlgpQ/pubhtml"
            // src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRYLvmgQNaKbs35iOjZFBHK4LjDxgH3h87BbTkJoXh-VGy7aR7rE8MG6gfZBJlgpQ/pubhtml?widget=true&amp;headers=false"
          ></iframe> */}
        </div>
      ))}
    </>
  );
}
