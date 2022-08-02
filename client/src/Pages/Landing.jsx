import { useEffect, useState } from 'react';
import { Grid, Typography, Button } from '@material-ui/core';
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
      {files.length === 0 ? (
        <div
          style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4">No File created yet</Typography>
        </div>
      ) : (
        files.map((f) => (
          <div key={f.id}>
            <div style={{ margin: '1em 0', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <Typography variant="h4"> Preview</Typography>
                <Button
                  variant="contained"
                  style={{
                    padding: '10px 30px',
                    background: '#000',
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '16px',
                  }}
                  component={'a'}
                  href={f.webContentLink}
                  download={f.fileName}
                >
                  Download
                </Button>
              </div>
              <Typography variant="h4">{new Date(f.date).toDateString()}</Typography>
            </div>

            <iframe
              style={{ width: '98vw', height: '100vw' }}
              src={f.file}
              //src={process.env.REACT_APP_API_URL + '/files/' + f.file}

              //src="https://drive.google.com/file/d/1_SkoGQEkAycjZ3dGz_M7OohDJohzLa0_/view?usp=drivesdk"
              //src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRYLvmgQNaKbs35iOjZFBHK4LjDxgH3h87BbTkJoXh-VGy7aR7rE8MG6gfZBJlgpQ/pubhtml"
              // src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRYLvmgQNaKbs35iOjZFBHK4LjDxgH3h87BbTkJoXh-VGy7aR7rE8MG6gfZBJlgpQ/pubhtml?widget=true&amp;headers=false"
            ></iframe>
          </div>
        ))
      )}
    </>
  );
}
