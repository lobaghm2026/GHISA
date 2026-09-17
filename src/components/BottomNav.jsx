export default function BottomNav({ active, onSchede, onStorico }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <button
          className={`nav-btn${active === 'schede' ? ' active' : ''}`}
          onClick={onSchede}
        >
          <span className="nav-dot" />
          Schede
        </button>
        <button
          className={`nav-btn${active === 'storico' ? ' active' : ''}`}
          onClick={onStorico}
        >
          <span className="nav-dot" />
          Storico
        </button>
      </div>
    </nav>
  )
}
