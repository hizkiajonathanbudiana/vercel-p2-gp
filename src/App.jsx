import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import SearchEmailPage from "./pages/SearchEmailPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyPassPage from "./pages/VerifyPassPage";
import RankPage from "./pages/RankPage";

import { SocketProvider } from "./contexts/SocketContext";
import { fetchUser } from "./features/appSlice";

// This route guard ensures the user is LOGGED IN.
// It protects routes that require a session, including the verification page itself.
const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.app);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If logged in, provide the SocketContext and render the child routes
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
};

// This NEW route guard ensures the user is VERIFIED.
// It protects routes that should only be accessible after email verification.
const VerifiedRoute = () => {
  const { user } = useSelector((state) => state.app);

  // If the user object exists but isVerified is false, redirect to the verification page.
  if (user && !user.isVerified) {
    return <Navigate to="/verify" replace />;
  }

  // If verified, allow access to the intended route (e.g., /home, /rank).
  return <Outlet />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitializing, user } = useSelector(
    (state) => state.app
  );

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#1c1c2b",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Initializing Session...</h2>
      </div>
    );
  }

  return (
    <>
      <ToastContainer theme="dark" />
      <Routes>
        {/* --- Public Routes --- */}
        {/* These routes are for users who are NOT logged in. */}
        <Route
          path="/"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" />}
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <RegisterPage /> : <Navigate to="/home" />
          }
        />
        <Route
          path="/email/search"
          element={
            !isAuthenticated ? <SearchEmailPage /> : <Navigate to="/home" />
          }
        />
        <Route
          path="/password/verify"
          element={
            !isAuthenticated ? <VerifyPassPage /> : <Navigate to="/home" />
          }
        />

        {/* --- Protected Routes (Require Login) --- */}
        <Route element={<ProtectedRoute />}>
          {/* This route is for logged-in but potentially unverified users */}
          <Route
            path="/verify"
            element={
              user && user.isVerified ? <Navigate to="/home" /> : <VerifyPage />
            }
          />

          {/* --- Verified Routes (Require Login AND Verification) --- */}
          <Route element={<VerifiedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/rank" element={<RankPage />} />
          </Route>
        </Route>

        {/* --- Catch-all Route --- */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/home" : "/"} />}
        />
      </Routes>
    </>
  );
}

export default App;
