import { Route } from 'react-router-dom';
import { Home } from '@/components/home';

export const RootRoutes = () => {
  return (
    <>
      <Route exact path="/">
        <Home />
      </Route>
    </>
  );
};
