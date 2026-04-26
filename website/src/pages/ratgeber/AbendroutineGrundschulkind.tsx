import {
  RatgeberArticle,
  StepCard,
  Steps,
  PullQuote,
  Callout,
} from '../../components/RatgeberArticle';
import { Timeline } from '../../components/RatgeberFigures';

export default function RatgeberAbendroutineGrundschulkind() {
  return (
    <RatgeberArticle
      slug="abendroutine-grundschulkind"
      title="Die Abendroutine für Grundschulkinder: ruhiger runterkommen, besser schlafen"
      description="Abendroutine für 6- bis 8-Jährige: Warum 45 Minuten reichen, welche Reihenfolge wirklich Schlaf bringt, und wie du aus dem Zähneputz-Drama rauskommst."
      category="Abendroutine"
      readMinutes={9}
      publishedAt="2026-04-19"
      ogImage="/og-ratgeber-abendroutine.jpg"
      heroImage="/art/bioms/Sternenmeer_sea-of-stars.webp"
      heroAlt="Malerischer Sternenhimmel über einer Abendlandschaft, ruhiger Übergang in die Nacht."
      related={[
        {
          slug: 'morgenroutine-grundschulkind',
          title: 'Die Morgenroutine, die wirklich klappt: was für 6- bis 8-Jährige funktioniert',
        },
        {
          slug: 'zaehneputzen-ohne-streit',
          title: 'Zähneputzen ohne Streit: was bei 5- bis 8-Jährigen wirklich hilft',
        },
        {
          slug: 'morgen-troedeln',
          title: 'Warum dein Kind morgens trödelt (und warum das kein Erziehungsproblem ist)',
        },
      ]}
    >
      <p className="lead">
        Es ist 19:52 Uhr. Du wolltest um 20 Uhr Licht aus. Dein Kind steht im
        Wohnzimmer, hat noch den Pulli an, den es um 15 Uhr aus der Schule
        mitgebracht hat, und ist gerade sehr beschäftigt damit, dem
        Plüschdrachen einen Monolog zu halten.
      </p>

      <p>
        Von Zähneputzen ist noch keine Rede.
      </p>

      <p>
        Wenn du den Satz kennst, lies weiter. Die gute Nachricht ist: der
        Morgen ist fast immer die Folge des Abends, nicht andersrum. Das heißt,
        wenn du die Abende entspannter hinkriegst, fallen dir die Morgen
        oft halb von selbst in den Schoß. Die schlechte Nachricht ist: abends
        sind alle kaputt. Du auch. Ich auch. Das ist der Kontext, in dem das
        Ganze stattfinden muss.
      </p>

      <h2>Warum der Abend eigentlich wichtiger ist als der Morgen</h2>

      <Callout type="forschung">
        <p>
          Grundschulkinder zwischen sechs und neun brauchen ungefähr zehn bis
          elf Stunden Schlaf pro Nacht. Das empfehlen die Deutsche Gesellschaft
          für Kinder- und Jugendmedizin und die Deutsche Gesellschaft für
          Schlafforschung ziemlich einhellig. Wenn das Kind um 6:30 Uhr aufstehen
          soll, muss es ungefähr um 20 Uhr schlafen. Nicht im Bett liegen.
          Schlafen.
        </p>
        <p>
          Zwischen ins-Bett-gehen und tatsächlich-einschlafen liegen bei den
          meisten Kindern 15 bis 30 Minuten. Das heißt Licht aus spätestens
          19:45 Uhr, damit die biologische Rechnung aufgeht. Und damit fängt
          die ganze Planung rückwärts an.
        </p>
      </Callout>

      <p>
        Dahinter steckt ein bisschen simple Biologie. Melatonin, das Hormon,
        das uns schläfrig macht, wird ab dem späten Nachmittag ausgeschüttet.
        Blaulicht aus Bildschirmen und grelles Deckenlicht bremsen diese
        Ausschüttung. Gleichzeitig muss die Körpertemperatur leicht sinken,
        damit das Einschlafen funktioniert. Ein aufgedrehtes, heißgelaufenes
        Kind schläft nicht einfach so ein, weil du das Licht ausmachst. Sein
        Körper ist einfach noch nicht so weit.
      </p>

      <p>
        Das ist keine Wissenschafts-Vorlesung, sondern der Grund, warum so
        viele Abendroutinen scheitern: sie ignorieren den Körper und setzen
        darauf, dass Willenskraft den Rest regelt. Tut sie nicht.
      </p>

      <h2>Die fünf klassischen Fallen</h2>

      <p>
        Bevor ich zur Lösung komme, die Sachen, die den Abend am zuverlässigsten
        ruinieren. Du erkennst wahrscheinlich mindestens drei davon wieder.
      </p>

      <Callout type="achtung" label="Abend-Killer">
        <ul>
          <li>
            <strong>Zu spät mit der Routine anfangen.</strong> Der häufigste
            Fehler. Um 19:30 Uhr denkt man <em>ach wir haben noch Zeit</em>,
            und zwanzig Minuten später fängt die Hetzerei an. Ab 19:45 Uhr
            müsstest du eigentlich aus dem Bad kommen, nicht erst reingehen.
            Der Puffer, den du früher am Abend einplanst, ist der einzige,
            den du am Ende wirklich hast.
          </li>
          <li>
            <strong>Bildschirmzeit bis kurz vor dem Schlafen.</strong> Eine
            Folge der Lieblingsserie um 19:40 Uhr, und das Kind ist danach
            heller wach als davor. Das ist nicht nur der Inhalt, das ist auch
            das Licht. Faustregel: eine Stunde vor dem Schlafen keine
            Bildschirme mehr, wenn es irgendwie geht. Wenn es nicht geht,
            wenigstens keine Action und keine schrillen Farben.
          </li>
          <li>
            <strong>Grelle Deckenlampen bis zum Schluss.</strong> Die meisten
            Wohnungen sind abends beleuchtet wie ein OP. Dabei ist das eine
            der einfachsten Stellschrauben überhaupt: eine kleine warme
            Tischlampe im Kinderzimmer, Deckenlicht aus, und die biologische
            Rechnung stimmt schon besser. Nicht dramatisch, aber messbar.
          </li>
          <li>
            <strong>Zu viele Reize gleichzeitig.</strong> Geschwister, die
            noch durch die Wohnung toben. Das Lego-Chaos im Kinderzimmer.
            Musik aus dem Nebenraum. Ein eingeschalteter Fernseher im
            Hintergrund. Für ein Kind, das gerade runterfahren soll, ist das
            zu viel Input. Die Abendroutine braucht eine Art sensorische
            Bremsspur.
          </li>
          <li>
            <strong>Unklare Reihenfolge.</strong>{' '}
            <em>Machst du erst Zähne oder erst Pyjama? Baden wir heute? Liest
            Papa vor oder Mama?</em> Jede dieser Fragen ist eine Entscheidung,
            die abends mental Geld kostet, das niemand mehr auf dem Konto hat.
            Wenn die Reihenfolge jeden Tag anders ist, wird sie jeden Tag
            verhandelt. Und Verhandlungen mit müden Kindern laufen bekanntlich
            schlecht.
          </li>
        </ul>
      </Callout>

      <h2>Die Routine, die bei uns funktioniert</h2>

      <p>
        45 Minuten reichen, wenn die Reihenfolge stimmt. Das ist die
        vielleicht wichtigste Zahl in diesem Artikel. Du brauchst keine
        Stunde. Du brauchst nicht 15 Minuten. Du brauchst 45, wenn sie in
        einer vernünftigen Sequenz liegen.
      </p>

      <p>Die Sequenz, die bei Louis stabil läuft, sieht so aus:</p>

      <Timeline
        direction="evening"
        ariaLabel="Abendroutine von 19:10 bis 19:55 Uhr mit sechs Stationen."
        stops={[
          { time: '19:10', label: 'Essen fertig', body: 'mindestens 1h vor Schlaf' },
          { time: '19:15', label: 'Runterkommen', body: 'kurz toben, dann ruhig' },
          { time: '19:25', label: 'Bad', body: 'Duschen oder nicht' },
          { time: '19:35', label: 'Pyjama', body: 'direkt ins Bett' },
          { time: '19:40', label: 'Vorlesen', body: 'der Anker' },
          { time: '19:55', label: 'Licht aus', body: 'gute Nacht', highlight: true },
        ]}
      />

      <Steps>
        <StepCard n={1} title="19:10 Uhr: Essen fertig">
          <p>
            Abendessen sollte mindestens eine Stunde vor dem Schlafen
            erledigt sein. Volle Mägen schlafen schlecht, zuckerreiches
            Essen noch schlechter.
          </p>
        </StepCard>
        <StepCard n={2} title="19:10 bis 19:20 Uhr: körperlich runterkommen">
          <p>
            Kurz toben, durchs Wohnzimmer hüpfen, einmal Kissenschlacht,
            dann bewusst leiser werden. Klingt kontraintuitiv, funktioniert
            aber.
          </p>
        </StepCard>
        <StepCard n={3} title="19:20 bis 19:35 Uhr: Bad">
          <p>
            Zähne putzen, eventuell duschen. Kurz, effizient, mit klarer
            Struktur.
          </p>
        </StepCard>
        <StepCard n={4} title="19:35 bis 19:40 Uhr: Pyjama an, ins Bett">
          <p>
            Kein Zwischenstopp am Spielzeugregal, kein kurzer Abstecher ins
            Wohnzimmer. Direkt vom Bad ins Bett.
          </p>
        </StepCard>
        <StepCard n={5} title="19:40 bis 19:55 Uhr: Vorlesen">
          <p>
            Gedämpftes Licht, leise Stimme, feste Länge.
          </p>
        </StepCard>
        <StepCard n={6} title="19:55 Uhr: Licht aus, gute Nacht">
          <p>
            Keine Verhandlung über noch eine Seite, kein schnelles noch-mal
            runter. Der Tag ist vorbei.
          </p>
        </StepCard>
      </Steps>

      <p>
        Die Zeiten sind Platzhalter. Du musst sie auf euch anpassen. Aber
        die Struktur dahinter bleibt tragfähig.
      </p>

      <h2>Warum körperlich runterkommen VOR dem Bad gehört</h2>

      <p>
        Das klingt nach einem Detail, ist aber für mich die wichtigste
        Einsicht der letzten zwei Jahre. Kinder, die aufgedreht ins Bad
        gehen, kommen wach raus. Das Wasser, das Licht im Bad, das Zähneputzen
        mit der elektrischen Bürste: das alles ist aktivierend, nicht
        beruhigend. Wenn dein Kind kurz vor dem Bad noch durch die Wohnung
        rennt, verlagert die Bad-Viertelstunde nur die Aufgedrehtheit auf
        später.
      </p>

      <PullQuote>
        Kinder, die aufgedreht ins Bad gehen, kommen wach raus.
      </PullQuote>

      <p>
        Die Lösung ist, die körperliche Entladung bewusst vor das Bad zu
        ziehen. Fünf Minuten Toben, dann langsam ausklingen lassen, dann
        Bad. Das Kind kommt schon ruhiger ins Bad rein, und verlässt es
        auch so. Der Effekt ist größer, als es sich anhört.
      </p>

      <h2>Vorlesen als Anker</h2>

      <p>
        Vorlesen ist nicht verhandelbar, selbst wenn dein Kind schon liest.
        Es geht nicht primär darum, dass es Geschichten hört. Es geht darum,
        dass eine vertraute Stimme ruhig und gleichmäßig wird und im gedämpften
        Licht ein Ritual bildet, das das Gehirn mit Schlaf verknüpft.
      </p>

      <p>
        Bei Louis lesen wir jeden Abend 10 bis 15 Minuten. Manchmal ist er
        nach fünf Minuten raus. Manchmal fragt er nach mehr. Aber der Rahmen
        ist fest. Die Minuten, die du hier investierst, sind mit Abstand die
        produktivsten des ganzen Abends. Und ich sage das als Gamer-Vater,
        der lieber eine Stunde Zelda hätte.
      </p>

      <h2>Autonomie dosiert einsetzen</h2>

      <p>
        Kinder in dem Alter wollen mitbestimmen. Das ist richtig und gut. Aber
        abends, wenn alle müde sind, ist das keine Zeit für offene Fragen
        wie <em>was willst du jetzt machen?</em>. Das endet in einer
        Verhandlung, die niemand gewinnt.
      </p>

      <p>
        Was funktioniert: ein bis zwei geschlossene Entscheidungen pro Abend.
        Welches Buch lesen wir? Welches T-Shirt nimmst du als Pyjama? Das
        reicht. Das gibt dem Kind das Gefühl von Kontrolle, ohne dass die
        ganze Routine zur Debatte steht.
      </p>

      <Callout type="wichtig">
        <p>
          Mehr Autonomie ist nicht besser. Im Gegenteil. Ein aufgedrehter
          Sechsjähriger, dem du um 19:45 Uhr sagst <em>du kannst selbst
          entscheiden, wann du ins Bett gehst</em>, ist kein souveränes Kind.
          Er ist ein überfordertes Kind, das du gerade im Stich gelassen hast.
          Autonomie funktioniert innerhalb eines Rahmens, nicht als Ersatz
          für einen.
        </p>
      </Callout>

      <h2>Wenn das Kind nicht einschlafen kann</h2>

      <p>
        Manchmal klappt alles, und das Kind liegt trotzdem wach. Die üblichen
        Verdächtigen, in der Reihenfolge, wie ich sie prüfen würde:
      </p>

      <ul>
        <li>
          <strong>Über-müdigkeit.</strong> Klingt paradox, ist aber der
          häufigste Grund. Ein Kind, das eigentlich seit einer Stunde hätte
          schlafen sollen, produziert Cortisol statt Melatonin. Es wirkt
          dann wach und aufgedreht, obwohl es komplett fertig ist. Abhilfe:
          früher anfangen.
        </li>
        <li>
          <strong>Stress und Sorgen.</strong> Schule, Streit mit Freunden,
          ein Film, der nachhallt. Wenn das Kind reden will, gib fünf
          Minuten. Nicht 45. Fünf Minuten, ehrlich zugehört, wirken mehr
          als eine Stunde Diskussion.
        </li>
        <li>
          <strong>Licht.</strong> Straßenlaternen, Bildschirme im Nebenraum,
          Nachttischlampen. Manche Kinder sind erstaunlich lichtempfindlich.
          Verdunkelungsrollo probieren.
        </li>
        <li>
          <strong>Essen zu spät oder zu viel Zucker.</strong> Der Abend-Snack
          um 19:30 Uhr kann reichen, um den ganzen Plan zu kippen.
        </li>
        <li>
          <strong>Zu wenig Bewegung tagsüber.</strong> Wenn das Kind
          hauptsächlich gesessen hat, fehlt dem Körper die physische
          Müdigkeit.
        </li>
      </ul>

      <Callout type="achtung" label="Wann zum Kinderarzt">
        <p>
          Wenn das Kind über Wochen hinweg massive Einschlafprobleme hat, nicht
          nur hier und da, gehört das zur Kinderärztin oder zum Kinderarzt. Es
          gibt echte Schlafstörungen auch in diesem Alter, und die sind meistens
          gut behandelbar. Das ist kein Versagen als Eltern, das ist einfach
          eine andere Liga.
        </p>
      </Callout>

      <h2>Wo Ronki abends passt</h2>

      <p>
        Der Abend ist der Moment, an dem ein Tag verarbeitet wird. Wenn
        die Schritte durch sind und das Licht noch nicht ganz aus ist, hat
        ein Kind ein paar Minuten, in denen alles noch da ist: was schwer
        war, was schön war, was geblieben ist. Genau in diesen Spalt sitzt
        Ronki.
      </p>

      <p>
        Viele Eltern, die Ronki ausprobieren, fangen beim Abend an, nicht
        beim Morgen. Der Schmerz ist abends oft greifbarer: am Morgen gibt
        es wenigstens einen externen Takt (die Schulzeit), am Abend musst
        du den ganzen Rahmen selbst halten.
      </p>

      <p>
        Ronki zeigt die Schritte. Ohne Push, ohne Drängen, ohne dem Kind
        zu sagen, wie spät es ist. Was Ronki abends besonders macht, ist
        der eine ruhige Beat nach den Schritten: ein Drache, der einmal
        nachfragt, wie der Tag war. Drei Worte reichen. Manchmal nur ein
        Gesicht. Das Kind weiß: jemand hat zugehört.
      </p>

      <blockquote>
        Wir bauen Ronki nicht für Kinder, die jeden Abend in die App
        müssen. Wir bauen ihn für den einen ruhigen Beat zwischen Zähne
        und Licht-aus. Wenn der bei euch irgendwann ohne den Drachen
        funktioniert, war er gut.
      </blockquote>

      <p>
        Wenn dich das interessiert, trag dich unten ein. Wenn nicht, nimm
        die Prinzipien aus diesem Artikel mit. Die funktionieren auch ohne
        uns.
      </p>

      <h2>Wenn es mal nicht klappt</h2>

      <p>
        Ein letzter Punkt, der mir wichtig ist. Die Abendroutine wird nicht
        jeden Tag klappen. Louis hat Abende, an denen er um 19:30 Uhr noch
        total aufgedreht ist, weil der Tag ihn überrollt hat. An solchen
        Abenden ist 20:30 Uhr völlig in Ordnung. Die Katastrophe kommt nicht
        vom einzelnen schlechten Abend, sie kommt vom chronischen schlechten
        Abend.
      </p>

      <p>
        Perfektionismus ist hier keine Hilfe, er ist Teil des Problems. Die
        Eltern, die abends am meisten kämpfen, sind oft die, die sich selbst
        am stärksten daran messen, ob das Kind um Punkt 20 Uhr die Augen
        zumacht. Dieser Druck überträgt sich. Er macht den Abend schwerer,
        nicht leichter.
      </p>

      <h2>Was du heute tun kannst</h2>

      <Callout type="ausprobieren">
        <p>
          Eine einzige Aufgabe. Schreib auf einen Zettel die Reihenfolge deiner
          Abendroutine. Zehn Minuten Arbeit. Heute Abend guckt ihr ihn zusammen
          an. <em>Das ist, was wir machen. In dieser Reihenfolge. Fertig.</em>
        </p>
        <p>
          Klingt banal. Ist es auch. Aber die meisten Abendroutinen existieren
          nur in einem einzigen Kopf, nämlich deinem. Sobald die Sequenz
          sichtbar ist, passieren zwei Sachen: das Kind muss nicht mehr raten,
          was als nächstes kommt. Und du musst nicht mehr jedes Mal aufs Neue
          ansagen, was dran ist. Beides spart Kraft. Beides macht die Abende
          leiser.
        </p>
      </Callout>

      <p>
        Und wenn es nach einer Woche nicht klappt, probier noch eine Woche.
        Die Abendroutine ist ein Muskel, kein Schalter. Sie wird besser. Und
        irgendwann wirst du abends auf die Uhr gucken, und es ist 19:48 Uhr,
        und dein Kind liegt schon im Bett und wartet aufs Vorlesen. Und du
        denkst, dass das eigentlich ziemlich normal geworden ist. Das ist
        das Ziel.
      </p>
    </RatgeberArticle>
  );
}
