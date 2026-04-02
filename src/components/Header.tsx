const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const MoreIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="19" cy="12" r="1"/>
    <circle cx="5" cy="12" r="1"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" x2="12" y1="2" y2="15"/>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

interface HeaderProps {
  userEmail?: string;
  onSignOut?: () => void;
}

export function Header({ userEmail, onSignOut }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="btn btn-icon btn-ghost" aria-label="Menu">
          <MenuIcon />
        </button>
        <nav className="breadcrumb">
          <span>Notes</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">My Notes</span>
        </nav>
      </div>

      <div className="header-actions">
        {userEmail && (
          <span style={{ fontSize: '13px', color: 'var(--muted)', marginRight: '8px' }}>
            {userEmail}
          </span>
        )}
        <button className="btn btn-ghost btn-icon" aria-label="Favorite">
          <StarIcon />
        </button>
        <button className="btn btn-ghost btn-icon" aria-label="Share">
          <ShareIcon />
        </button>
        {onSignOut && (
          <button className="btn btn-ghost" onClick={onSignOut} title="Sign out">
            <LogOutIcon />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </header>
  );
}
