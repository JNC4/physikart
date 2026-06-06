import Overture from "@/components/exhibition/Overture";
import Interlude from "@/components/exhibition/Interlude";
import Coda from "@/components/exhibition/Coda";
import ReactionDiffusionWitness from "@/components/witnesses/ReactionDiffusionWitness";
import ChladniWitness from "@/components/witnesses/ChladniWitness";
import JuliaWitness from "@/components/witnesses/JuliaWitness";
import FeigenbaumWitness from "@/components/witnesses/FeigenbaumWitness";
import CarbonResonanceWitness from "@/components/witnesses/CarbonResonanceWitness";
import PhyllotaxisWitness from "@/components/witnesses/PhyllotaxisWitness";

/**
 * The exhibition: one argued scroll. An overture states the thesis once; each
 * plate is a witness to it, joined by a single connective line; the coda lets
 * the plates make the case and closes on the epigraph. The plates climb a
 * scale, from matter to sound to pure number to the cosmos to life.
 */
export default function Home() {
  return (
    <main>
      <Overture plateCount="six" />

      <ReactionDiffusionWitness index={1} />
      <Interlude>
        Chemistry kept its pattern only inside a sliver of two rates. Hear the
        same edge now, in sound.
      </Interlude>

      <ChladniWitness index={2} />
      <Interlude>
        A figure forms only at exact pitches. Leave matter behind, for pure
        number.
      </Interlude>

      <JuliaWitness index={3} />
      <Interlude>
        One number decides whole or shattered. Now watch order keep perfect
        time, until it cannot.
      </Interlude>

      <FeigenbaumWitness index={4} />
      <Interlude>
        So far the numbers cost us nothing. Here is one the stars had to get
        right, or there would be no carbon, and no us.
      </Interlude>

      <CarbonResonanceWitness index={5} />
      <Interlude>
        The carbon was made inside a narrow band. See what a living thing does
        with a number once it has one.
      </Interlude>

      <PhyllotaxisWitness index={6} />

      <Coda />
    </main>
  );
}
