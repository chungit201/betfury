"use client";

import type { CSSProperties } from "react";
import { liveBets } from "@/data/bets-data";

const tabs = [
  { id: "switcher-casino", value: "casino", icon: "casino", label: " Casino Bets ", checked: true },
  { id: "switcher-sport", value: "sport", icon: "sport", label: " Sports Bets " },
  { id: "switcher-withdraw", value: "withdraw", icon: "staking", label: " Staking Payouts " },
  { id: "switcher-futures", value: "futures", icon: "futures", label: " Futures " },
];

const columns = [
  { cls: "statistic-header__item--name", label: "Game" },
  { cls: "statistic-header__item--time", label: "Time" },
  { cls: "statistic-header__item--user", label: "User" },
  { cls: "statistic-header__item--amount", label: "Bet Amount" },
  { cls: "statistic-header__item--multiplier", label: "Multiplier" },
  { cls: "statistic-header__item--payout", label: "Payout" },
];

export default function LiveBetsTable() {
  return (
    <div className="statistic-table statistic-table--visible" data-v-7a7ce604="">
      <div className="main-table main-table--casino" data-v-65fb1de0="">
        <div data-v-db109501="" className="statistic-navigation">
          <div data-v-db109501="" className="statistic-navigation__desktop">
            <div data-v-db109501="" className="statistic-navigation__switcher">
              {tabs.map((tab) => (
                <div key={tab.id} style={{ display: "contents" }}>
                  <input
                    data-v-db109501=""
                    id={tab.id}
                    type="radio"
                    className="statistic-navigation__switcher-input"
                    name="table-bets-switcher"
                    defaultChecked={tab.checked}
                    value={tab.value}
                  />
                  <label data-v-db109501="" className="statistic-navigation__switcher-label" htmlFor={tab.id}>
                    <span data-v-36d2042d="" data-v-db109501="" className="icon statistic-navigation__switcher-icon" data-name={tab.icon} style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
                      <svg data-v-36d2042d="" viewBox="0 0 16 17">
                        <use data-v-36d2042d="" href={`#icon-${tab.icon}`} />
                      </svg>
                    </span>
                    {tab.label}
                  </label>
                </div>
              ))}
            </div>
            <div data-v-db109501="" className="statistic-navigation__right">
              <div data-v-921da8b7="" data-v-db109501="" className="dropdown dropdown_md dropdown_bottom">
                <div data-v-921da8b7="" className="dropdown__trigger">
                  <div data-v-921da8b7="" className="trigger-content">
                    <span data-v-921da8b7="" className="trigger-content__text">
                      <span data-v-921da8b7="">10</span>
                    </span>
                  </div>
                  <span data-v-36d2042d="" data-v-921da8b7="" className="icon icon-arrow" data-name="chevron-down" style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties}>
                    <svg data-v-36d2042d="" viewBox="0 0 24 24">
                      <use data-v-36d2042d="" href="#icon-chevron-down" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="animation animation--shadow" data-v-65fb1de0="">
          <div data-v-2db9a2fd="" data-v-685f839f="" className="statistic-header">
            <div data-v-2db9a2fd="" className="statistic-header__list">
              {columns.map((col) => (
                <div data-v-2db9a2fd="" className={`statistic-header__item ${col.cls}`} key={col.cls}>
                  <div data-v-1e2757a8="" data-v-2db9a2fd="" className="tooltip">
                    <div data-v-1e2757a8="" className="icon">
                      <span data-v-2db9a2fd="" className="statistic-header__item-text">
                        {col.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="wrap" data-v-65fb1de0="">
            {liveBets.map((bet, i) => (
              <div data-v-3f79a83a="" data-v-685f839f="" className="statistic-line line" style={{ background: i % 2 === 0 ? "rgba(22, 31, 44, 0.8)" : "transparent" } as CSSProperties} key={i}>
                <div data-v-2a0fbb12="" data-v-685f839f="" className="name name--interactive element" style={{ "--icon-size": "24px" } as CSSProperties}>
                  <span data-v-36d2042d="" data-v-2a0fbb12="" className="icon name__icon" style={{ "--fd873e1a": "1em", "--fefcc86a": "none", "--v28dfdb28": "contain" } as CSSProperties} data-name={bet.icon}>
                    <svg data-v-36d2042d="" viewBox="0 0 24 24">
                      <use data-v-36d2042d="" href={`#icon-${bet.icon}`} />
                    </svg>
                  </span>
                  <div data-v-2a0fbb12="" className="name__wrap">
                    <div data-v-2a0fbb12="" className="name__label" title={bet.game}>
                      {bet.game}
                    </div>
                  </div>
                </div>
                <div data-v-775907f0="" data-v-685f839f="" className="time element">
                  <span data-v-ce577883="" data-v-775907f0="" className="datetime">
                    {bet.time}
                  </span>
                </div>
                <div data-v-122214d7="" data-v-685f839f="" className="user element">
                  <div data-v-eddcac09="" data-v-122214d7="" className="user user--clickable">
                    <div data-v-eddcac09="" className="user__avatar" style={{ width: "24px", height: "24px" } as CSSProperties}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bet.avatar} alt="" width={24} height={24} style={{ borderRadius: "50%" } as CSSProperties} />
                    </div>
                    <div data-v-eddcac09="" className="user__wrap user__wrap--cut">
                      <span data-v-eddcac09="" className="user__name user__name--cut">
                        {bet.user}
                      </span>
                    </div>
                  </div>
                </div>
                <div data-v-0fc517fc="" data-v-685f839f="" className="amount element">
                  <span data-v-e167b1c8="" data-v-0fc517fc="" className="currency">
                    <span data-v-e167b1c8="" style={{ color: "white" } as CSSProperties}>
                      <div data-v-e167b1c8="" className="currency__body" style={{ fontSize: "14px" } as CSSProperties}>
                        <div data-v-e167b1c8="" className="currency__data">
                          <span data-v-9ea0d0c4="" data-v-e167b1c8="" className="balance">
                            {bet.amount}
                          </span>
                        </div>
                      </div>
                    </span>
                  </span>
                </div>
                <div data-v-10a88154="" data-v-685f839f="" className="multiplier element">
                  <div data-v-10a88154="" className={`multiplier__item${bet.win ? " multiplier__item--win" : ""}`}>
                    {" " + bet.multiplier}
                  </div>
                </div>
                <div data-v-e760988c="" data-v-685f839f="" className="payout element">
                  <span data-v-e167b1c8="" data-v-e760988c="" className="currency currency--slice">
                    <span data-v-e167b1c8="" style={{ color: bet.win ? "rgb(27, 184, 61)" : "var(--Background-Tertiary)" } as CSSProperties}>
                      <div data-v-e167b1c8="" className="currency__body" style={{ fontSize: "14px" } as CSSProperties}>
                        <div data-v-e167b1c8="" className="currency__data">
                          <span data-v-9ea0d0c4="" data-v-e167b1c8="" className="balance">
                            {bet.payout}
                          </span>
                        </div>
                      </div>
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
