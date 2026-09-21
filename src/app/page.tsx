import AppShell from "@/components/AppShell";
import Hero from "@/components/Hero";
import Blocks from "@/components/Blocks";
import GameSlider from "@/components/GameSlider";
import RecentWinsSlider from "@/components/RecentWinsSlider";
import BuyCrypto from "@/components/BuyCrypto";
import SportsRow from "@/components/SportsRow";
import CryptoStaking from "@/components/CryptoStaking";
import Currencies from "@/components/Currencies";
import LiveBetsTable from "@/components/LiveBetsTable";
import Feedback from "@/components/Feedback";
import SiteFooter from "@/components/SiteFooter";
import { inhouseGames, topSlots } from "@/data/games-data";

export default function Home() {
  return (
    <AppShell>
      <main className="wrapper" data-v-6f8a5598="">
        <div className="wrapper__inner sp" data-v-6f8a5598="">
          <div className="container global-container" data-v-6f8a5598="">
            <div className="page-main" data-v-7a7ce604="">
              <Hero />
              <Blocks />
              <div className="sliders sliders--reverse-casino" data-v-bbc21d8c="">
                <GameSlider title="Top Slots" titleHref="/casino/slots" linkText="Go to Slots" linkHref="/casino/slots" games={topSlots} />
                <GameSlider title="InuSlots Originals" titleHref="/casino/originals" linkText="Go to Casino" linkHref="/casino/originals" games={inhouseGames} />
                <RecentWinsSlider />
                <BuyCrypto />
                <SportsRow />
                <CryptoStaking />
              </div>
              <Currencies />
              <LiveBetsTable />
            </div>
          </div>
        </div>
        <Feedback />
        <SiteFooter />
      </main>
    </AppShell>
  );
}
