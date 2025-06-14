import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import Component1 from "./pages/Component1";
import Component2 from "./pages/Component2";
import Component3 from "./pages/Component3";
import Component4 from "./pages/Component4";
import Component5 from "./pages/Component5";
import Component6 from "./pages/Component6";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "";
        metaDescription = "";
        break;
      case "/":
        title = "";
        metaDescription = "";
        break;
      case "/1":
        title = "";
        metaDescription = "";
        break;
      case "/top-page":
        title = "";
        metaDescription = "";
        break;
      case "/show-page":
        title = "";
        metaDescription = "";
        break;
      case "/comment-page":
        title = "";
        metaDescription = "";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Component1 />} />
      <Route path="/" element={<Component2 />} />
      <Route path="/1" element={<Component3 />} />
      <Route path="/top-page" element={<Component4 />} />
      <Route path="/show-page" element={<Component5 />} />
      <Route path="/comment-page" element={<Component6 />} />
    </Routes>
  );
}
export default App;
