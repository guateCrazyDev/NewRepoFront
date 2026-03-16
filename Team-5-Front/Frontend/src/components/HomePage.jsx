import "./HomePage.css";
import GridTemplate from "./GridTemplate";

function HomePage() {
  return (
    <div className="home-page">
      <div className="template">
        <div className="image-div">
          <img src="/images/mainPage.jpg" alt="hero" />
        </div>
      </div>
        <GridTemplate />
    </div>
  );
}

export default HomePage;
