"use client";

import StaggeredMenu from './StaggeredMenu';

const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Play the Game!', ariaLabel: 'Play the Game!', link: '/play' }
];

const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' }
];

export function Navbar() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
            <StaggeredMenu
                position="right"
                items={menuItems}
                socialItems={socialItems}
                displaySocials
                displayItemNumbering={true}
                menuButtonColor="#ffffff"
                openMenuButtonColor="#fff"
                changeMenuColorOnOpen={true}
                colors={['#B497CF', '#5227FF']}
                logoUrl="/images/logo.svg"
                accentColor="#5227FF"
                onMenuOpen={() => {}}
                onMenuClose={() => {}}
            />
        </div>
    );
}