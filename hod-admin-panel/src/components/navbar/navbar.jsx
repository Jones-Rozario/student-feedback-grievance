import React from 'react'
import { FaBell, FaUser } from 'react-icons/fa';
import './navbar.scss'

const NavBar = ({ onHamburgerClick }) => (
  <div className="navbar">
    <div className="navbar__left">
      <button className="navbar__hamburger" onClick={onHamburgerClick}>
        <span />
        <span />
        <span />
      </button>
      <span className="navbar__title">Stats</span>
    </div>
    <div className="navbar__right">
      <FaBell className="navbar__icon" />
      <FaUser className="navbar__icon" />
    </div>
  </div>
)

export default NavBar