// Port of Cal.diy apps/web/modules/shell (Shell.tsx, SideBar.tsx, navigation/*,
// user-dropdown/UserDropdown.tsx). Markup and classes are kept as in the source;
// only Next.js, session, i18n and analytics wiring is removed.
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";

import classNames from "./classNames";
import { Icon, type IconName } from "./Icon";

export type NavItem = { name: string; icon: IconName; current?: boolean; onClick?: () => void };

function NavigationItem({ item }: { item: NavItem }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        item.onClick?.();
      }}
      aria-label={item.name}
      aria-current={item.current ? "page" : undefined}
      className={classNames(
        "todesktop:py-[7px] text-default group flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition",
        "[&[aria-current='page']]:bg-emphasis",
        "[&[aria-current='page']]:text-emphasis mt-0.5 text-sm md:justify-center lg:justify-start",
        "hover:bg-subtle hover:text-emphasis"
      )}>
      <Icon
        name={item.icon}
        className="h-4 w-4 shrink-0 aria-[aria-current='page']:text-inherit lg:ltr:mr-2 lg:rtl:ml-2"
        aria-hidden="true"
      />
      <span className="hidden w-full justify-between truncate text-ellipsis lg:flex">{item.name}</span>
    </a>
  );
}

function UserDropdown({ name, onSignOut }: { name: string; onSignOut?: () => void }) {
  return (
    <button
      type="button"
      onClick={onSignOut}
      title="Sign out"
      className="hover:bg-emphasis group mx-0 flex w-full cursor-pointer appearance-none items-center rounded-full px-2 py-1.5 text-left outline-none transition focus:outline-none focus:ring-0 md:rounded-none lg:rounded">
      <span className="relative h-5 w-5 shrink-0 rounded-full ltr:mr-2 rtl:ml-2">
        <span className="bg-emphasis text-emphasis flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-[10px] font-medium">
          {name.charAt(0)}
        </span>

      </span>
      <span className="flex grow items-center gap-2">
        <span className="w-24 shrink-0 text-sm leading-none">
          <span className="text-emphasis block truncate py-0.5 font-medium leading-normal">{name}</span>
        </span>
        <ChevronDownIcon
          className="group-hover:text-subtle text-muted h-4 w-4 shrink-0 transition rtl:mr-4"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}

function SideBar({
  userName,
  nav,
  bottomNav,
  onSignOut,
}: {
  userName: string;
  nav: NavItem[];
  bottomNav: NavItem[];
  onSignOut?: () => void;
}) {
  return (
    <div className="relative">
      <aside
        style={{ maxHeight: "calc(100vh - 0px)", top: "0px" }}
        className={classNames(
          "fixed left-0 hidden h-full w-14 flex-col overflow-y-auto overflow-x-hidden border-muted border-r bg-cal-muted md:sticky md:flex lg:w-56 lg:px-3",
          "max-h-screen"
        )}>
        <div className="flex h-full flex-col justify-between py-3 lg:pt-4">
          <header className="items-center justify-between md:hidden lg:flex">
            <div className="w-full">
              <span className="hidden lg:inline">
                <UserDropdown name={userName} onSignOut={onSignOut} />
              </span>
            </div>

          </header>
          <nav className="mt-2 flex-1 md:px-2 lg:mt-4 lg:px-0">
            {nav.map((item) => (
              <NavigationItem key={item.name} item={item} />
            ))}
          </nav>
        </div>

        <div className="md:px-2 md:pb-4 lg:p-0">
          {bottomNav.map((item, index) => (
            <a
              key={item.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                item.onClick?.();
              }}
              aria-label={item.name}
              className={classNames(
                "text-left",
                "justify-right group flex items-center rounded-md px-2 py-1.5 font-medium text-default text-sm transition [&[aria-current='page']]:bg-emphasis",
                "mt-0.5 w-full text-sm [&[aria-current='page']]:text-emphasis",
                "hover:bg-subtle hover:text-emphasis",
                index === 0 && "mt-3"
              )}>
              <Icon
                name={item.icon}
                className="h-4 w-4 shrink-0 ml-3 md:mx-auto lg:ltr:mr-2 lg:rtl:ml-2"
                aria-hidden="true"
              />
              <span className="hidden w-full justify-between lg:flex">
                <div className="flex">{item.name}</div>
              </span>
            </a>
          ))}
          <div className="mb-4" />
        </div>
      </aside>
    </div>
  );
}

export type ShellProps = {
  heading?: ReactNode;
  subtitle?: ReactNode;
  CTA?: ReactNode;
  children: ReactNode;
  userName: string;
  nav: NavItem[];
  bottomNav: NavItem[];
  onSignOut?: () => void;
};

function ShellMain(props: ShellProps) {
  return (
    <>
      {props.heading && (
        <div className="bg-default sticky top-0 z-10 mb-4 md:mb-6 lg:mb-8">
          <header className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <h1 className="font-cal text-emphasis break-words text-xl font-semibold tracking-wide">
                {props.heading}
              </h1>
              {props.subtitle && <p className="text-default text-sm">{props.subtitle}</p>}
            </div>
            {props.CTA && <div className="relative shrink-0">{props.CTA}</div>}
          </header>
        </div>
      )}
      <div>{props.children}</div>
    </>
  );
}

export default function Shell(props: ShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-2 focus:z-50 focus:rounded focus:bg-default focus:p-2 focus:text-default"
      >
        Skip to main content
      </a>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle bg-cal-muted p-3 lg:hidden">
        <nav aria-label="Compact navigation" className="flex flex-wrap gap-2">
          {props.nav.filter((item) => item.onClick).map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={item.onClick}
              aria-current={item.current ? "page" : undefined}
              className="rounded-md border border-subtle bg-default px-3 py-2 text-sm text-emphasis focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {item.name}
            </button>
          ))}
        </nav>
        {props.onSignOut && (
          <button
            type="button"
            onClick={props.onSignOut}
            className="rounded-md border border-subtle px-3 py-2 text-sm text-default focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Sign out
          </button>
        )}
      </div>
      <div className="flex flex-1" data-testid="dashboard-shell">
        <SideBar userName={props.userName} nav={props.nav} bottomNav={props.bottomNav} onSignOut={props.onSignOut} />
        <div className="flex w-0 flex-1 flex-col">
          <main id="main-content" tabIndex={-1} className="bg-default relative z-0 flex-1 focus:outline-none">
            <div className="max-w-full p-2 sm:p-4 lg:p-6">
              <ShellMain {...props} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
