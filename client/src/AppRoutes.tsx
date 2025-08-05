import React from "react";
import { Route, Routes,Navigate } from "react-router-dom";  
import LoadingSpinner from "../src/components/LoadingSpinner"
const Test = React.lazy(()=> import("./pages/Test"))


const AppRoutes = () => {
  return (
    <Routes>
                 <Route path="/"
                  element={
                  <React.Suspense fallback={<LoadingSpinner/>}>
                  <Test/>
                  </React.Suspense>}
                 />
               
      </Routes>
  );
};

export default AppRoutes;