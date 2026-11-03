import { ArchitectureStory } from '../components/hero/ArchitectureStory';
import { ConferenceHighlights } from '../components/sections/Highlights';
import { SpeakerShowcase } from '../components/sections/Speakers';
import { ConferenceProgramme } from '../components/sections/Programme';
import { RegistrationSection } from '../components/sections/RegistrationBand';
import { VenueSection } from '../components/sections/VenueReveal';
import { SupportingOrganisations } from '../components/sections/SupportingOrganisations';

export function Home() {
  return (
    <>
      <ArchitectureStory />
      {/* Everything after the story slides up over the fixed processor stage */}
      <div className="after-story-wrap">
        <ConferenceHighlights />
        <SpeakerShowcase />
        <ConferenceProgramme />
        <RegistrationSection />
        <VenueSection />
        <SupportingOrganisations />
      </div>
    </>
  );
}
