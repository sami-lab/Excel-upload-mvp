import Layout from './Components/Layout/Layout';
import { Routes, Route } from 'react-router-dom';
import Main from './Pages/Landing';
import MoviesList from './Pages/MoviesList';

function App() {
  return (
    <Layout>
      <Routes>
        <Route exact path="/" element={<Main />} />
        <Route path="/upload" element={<MoviesList />} />
      </Routes>
    </Layout>
  );
}

export default App;
