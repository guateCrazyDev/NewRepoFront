import { useEffect, useState } from 'react'
import './HomePage.css'
import GridTemplate from '../components/GridTemplate'

function HomePage() {

  return (
    <div className="home-page">
      <section className="hero">
        <img src="/images/HomeImage.jpg" alt="hero" />

        <div className="hero-overlay">
          <h1>Travel around the world</h1>
          <p>Discover your next destination</p>

          <div className="search-box">
            <input type="text" placeholder="Search a Landscape" />
            <button>Search</button>
          </div>
        </div>
      </section>
      <GridTemplate/>
    </div>
  )
}

export default HomePage
