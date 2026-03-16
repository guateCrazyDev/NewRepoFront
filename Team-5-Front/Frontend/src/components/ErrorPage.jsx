import "./ErrorPage.css";
import "animate.css";

function ErrorPage() {
  return (
    <div className="ErrorPage-Container">
      <h2>
        Oooooooops! <br />
        Something Went Wrong
      </h2>
      <span>Please try again later.</span>
      <img
        id="Warning"
        className="animate__animated animate__tada animate__infinite"
        src="../public/icons/warning.png"
        alt="Warning"
      ></img>
    </div>
  );
}

export default ErrorPage;
