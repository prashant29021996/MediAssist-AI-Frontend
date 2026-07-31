"use client";

import React, { useState } from 'react';
import { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '@/components/ui/dropdown';
import { ChangePasswordModal } from '@/components/ui/change-password-modal';
import { useAuth } from '@/lib/auth-context';

interface UserMenuProps {
  /** Optional badge/content to show next to the menu trigger (e.g. role badge) */
  badge?: React.ReactNode;
  /** Additional navigation links to show in the dropdown */
  extraItems?: React.ReactNode;
}

/**
 * User avatar dropdown menu with Change Password and Sign Out actions.
 * Wraps the ChangePasswordModal so pages only need to render <UserMenu />.
 */
export function UserMenu({ badge, extraItems }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() ||
      user.email[0].toUpperCase()
    : '?';

  return (
    <>
      <div className="flex items-center gap-4">
        {badge}
        <Dropdown
          trigger={
            <span className="flex items-center gap-2 cursor-pointer">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {initials}
              </span>
              <span className="text-sm text-gray-700">{user?.email}</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          }
        >
          <DropdownLabel>{user?.email}</DropdownLabel>
          {extraItems && (
            <>
              {extraItems}
              <DropdownSeparator />
            </>
          )}
          <DropdownItem onClick={() => setShowChangePassword(true)}>
            Change Password
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem variant="danger" onClick={logout}>
            Sign out
          </DropdownItem>
        </Dropdown>
      </div>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
}