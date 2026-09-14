import AppRouter from './routes/AppRouter';
import { QuoteProvider } from './context/QuoteContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <QuoteProvider>
        <AppRouter />
      </QuoteProvider>
    </AuthProvider>
  );
}

export default App;