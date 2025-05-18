
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-orange">404</h1>
        <p className="text-xl text-white mb-8">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We couldn't find the page you were looking for. The page might have been removed or the URL might be incorrect.
        </p>
        <Button asChild className="bg-orange hover:bg-orange-light">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
