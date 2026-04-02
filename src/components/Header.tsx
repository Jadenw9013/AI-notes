const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" x2="9" y1="12" y2="12"/>
  </svg>
);

interface HeaderProps {
  userEmail?: string;
  noteTitle?: string;
  onSignOut?: () => void;
}

export function Header({ userEmail, noteTitle, onSignOut }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <nav className="breadcrumb">
          <span>Notes</span>
          {noteTitle && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{noteTitle}</span>
            </>
          )}
        </nav>
      </div>

      <div className="header-actions">
        {userEmail && (
          <span className="header-user-email">
            {userEmail}
          </span>
        )}
        {onSignOut && (
          <button className="btn btn-ghost btn-sm" onClick={onSignOut} title="Sign out">
            <LogOutIcon />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </header>
  );
}
