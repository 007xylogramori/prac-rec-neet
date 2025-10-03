import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-5xl font-bold text-foreground">404</h1>
          <p className="mb-6 text-muted-foreground">Page not found</p>
          <Link to="/" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            Go home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
