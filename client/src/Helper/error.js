import React from 'react';

export default function Error(props) {
  return (
    <div>
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: '900',
              backgroundImage: `url(/dev/error.jpg)`,
              backgroundRepeat: 'repeat',
              WebkitTextFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            id="error"
          >
            Oops!
          </h1>

          <h2
            style={{
              fontFamily: 'Montserrat',
              color: '#000',
              fontSize: '1.5rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              marginTop: '-5em',
            }}
          >
            {props.message}
          </h2>
        </div>
      </div>
    </div>
  );
}
