/**
 * ─────────────────────────────────────────────────────────────
 *  MISSION 23 · EDITABLE CONTENT
 *  Every message, joke and personal detail in the universe lives here.
 *  Change the text between the quotes; keep the quotes and commas.
 * ─────────────────────────────────────────────────────────────
 */

export const PERSONAL = {
  age: 23,
  /** Optional: his name. Leave '' to keep the site anonymous (recommended for a public URL). */
  recipientName: '',
  /** How the birthday letter is signed. */
  signature: 'Your Mission Control',
  /** Hoodie illustration colours: match them to the real hoodie you made. */
  hoodieColor: '#1E2452',
  hoodieShade: '#151a3d',
  hoodieLining: '#A79ACD',
  /** The message hidden inside the hood. */
  hoodieMessage: 'The universe has its own rhythm.',
};

export const OPENING = {
  invitation: 'Some things begin with a single star.',
  holdHint: 'touch & hold',
  title: 'MISSION 23',
  subtitle: 'A Universe Still Unwritten',
  briefing: [
    'Pilot identified.',
    'Age: 23.',
    'Curiosity level: unusually high.',
    'Number of unfinished dreams: classified.',
  ],
  waiting: 'Your universe is waiting.',
  launchHint: 'swipe the rocket up to launch',
  returning: ['Pilot re-identified.', 'Welcome back.', 'Your universe kept your place.'],
};

export const WORLD_ONE = {
  eyebrow: 'World One',
  title: 'The Universe You Haven’t Met Yet',
  hint: 'Tap a destination. The rocket knows the way.',
  destinations: {
    jazz: { name: 'The Jazz Garden', number: '01' },
    library: { name: 'The Library of Unfinished Ideas', number: '02' },
    flavor: { name: 'The Planet of Unknown Flavors', number: '03' },
    victories: { name: 'The Constellation of Small Victories', number: '04' },
  },
  moonSecret:
    'You found the moon’s secret. It has been quietly rooting for you this whole time. (So have I.)',
  allVisited: ['Anomaly detected.', 'The stars you touched are… moving.'],
};

export const JAZZ = {
  hint: 'Touch the flowers. Each one is a note.',
  message: [
    'Some people learn to play an instrument.',
    'Others find another language to express themselves.',
  ],
  message2: 'I think you’re one of the second kind.',
  missionControl: ['Warning: musical talent detected.', 'Remaining planets have requested an encore.'],
  saxJokes: [
    'The saxophone would like to point out it has been waiting for you.',
    'Saxophone status: politely showing off.',
    'Unexpected intelligence detected. Pretending to be surprised.',
  ],
  playback: 'Play back your melody',
};

export const LIBRARY = {
  hint: 'Tap a drifting book to open it.',
  books: [
    {
      title: 'On Knowing Things',
      color: '#A79ACD',
      text: 'Knowing everything would be terribly boring. Luckily, you seem determined to keep discovering things.',
    },
    {
      title: 'Field Notes',
      color: '#D8A9B6',
      text: 'Your curiosity might be one of your most interesting qualities.',
    },
    {
      title: 'The First Question',
      color: '#E9CFA0',
      text: 'Some of the best ideas begin with someone asking a question nobody else thought to ask.',
    },
    {
      title: 'Borrowed Telescopes',
      color: '#7f86c9',
      text: 'Every good book is a telescope someone else built, so you could see a little further.',
    },
    {
      title: 'Unfinished',
      color: '#c98f86',
      text: 'An unfinished idea isn’t a failure. It’s an idea still deciding what it wants to be.',
      /** This book hides a folded note in its margin. */
      secret: true,
    },
  ],
  secretNote: 'A note in the margin: I really like listening to you explain things you’re excited about.',
  missionControl: ['Scientific conclusion:', 'more exploration required.'],
};

export const FLAVOR = {
  hint: 'Drag the specimen to rotate it.',
  fruits: [
    {
      name: 'The Moonquince',
      ingredients: [
        '31% comet zest',
        'a pinch of cinnamon from a planet that doesn’t exist',
        'trace amounts of thunder',
        'one (1) suspicious seed',
      ],
      body: '#D8A9B6',
      accent: '#A79ACD',
    },
    {
      name: 'Gravity Fig',
      ingredients: [
        'slightly heavier than it looks',
        'notes of honey, rain & philosophy',
        'a crunchy bit nobody can explain',
        '0% regret (unverified)',
      ],
      body: '#8d7fc4',
      accent: '#E9CFA0',
    },
    {
      name: 'Nebula Berry',
      ingredients: [
        'fizzy, like a good idea',
        '12% stardust, 88% mystery',
        'tastes faintly of purple',
        'may hum quietly when ripe',
      ],
      body: '#E9CFA0',
      accent: '#D8A9B6',
    },
  ],
  scanning: ['Unknown object detected.', 'Edible? Probably.', 'Delicious? The scientific community remains divided.'],
  choices: [
    { label: 'Take a tiny bite', reply: 'Result: surprisingly okay. Possibly tastes like purple.' },
    { label: 'Just admire it', reply: 'Completely valid. Observation is also science.' },
    { label: 'Ask it questions', reply: 'The fruit has declined to comment at this time.' },
  ],
  pokes: [
    'Please stop poking the specimen.',
    'The specimen is ticklish.',
    'The specimen has filed a formal complaint.',
  ],
  message: [
    'Trying something unfamiliar doesn’t mean you have to love it.',
    'Sometimes being curious enough to explore is already something.',
  ],
};

export const VICTORIES = {
  hint: 'Drag from the glowing star to the next one.',
  /** One small victory appears per connection (8 stars, 7 connections). */
  reminders: [
    'Asking one more question than necessary.',
    'Practising the hard part instead of the fun part.',
    'Looking at the strange food bravely. (Tasting optional.)',
    'Starting something without knowing how it ends.',
    'Showing up on a tired day.',
    'Learning one thing you didn’t know yesterday.',
    'Letting yourself be a beginner.',
  ],
  constellationName: 'Saxophonus Minor',
  constellationNote: 'the constellation of small victories',
  message: ['Progress isn’t always loud.', 'Sometimes it’s simply the fact that you tried again.'],
};

export const TRANSITION = {
  lines: ['But this isn’t the end of your story.', 'There are entire universes you haven’t met yet.'],
  hint: 'slide up through the doorway',
};

export const WORLD_TWO = {
  eyebrow: 'World Two',
  title: 'The Future That Hasn’t Happened Yet',
  hint: 'Four doors. Any order.',
  doors: {
    music: { name: 'The Music You Haven’t Played Yet' },
    workshop: { name: 'The Ideas You Haven’t Built Yet' },
    places: { name: 'The Places You Haven’t Discovered Yet' },
    becoming: { name: 'The Person You’re Still Becoming' },
  },
  telescope: 'Telescope report: everything is still out there. Waiting for you.',
  allOpen: 'Something has appeared in the telescope.',
};

export const MUSIC_HALL = {
  hint: 'Touch the stage.',
  message: ['Somewhere in your future, there’s a melody you haven’t played yet.', 'I hope you get to hear it.'],
  improviser: 'Every melody here is improvised fresh. Nobody has ever heard that one before.',
};

export const WORKSHOP = {
  hint: 'Drag a sketch onto the workbench.',
  sketches: [
    { id: 'orrery', label: 'An idea for how everything fits together' },
    { id: 'lighthouse', label: 'An idea that helps someone find their way' },
    { id: 'bridge', label: 'An idea that connects two places' },
  ],
  message: ['I love how seriously you take the things you care about.', 'I hope you never lose that.'],
};

export const PLACES = {
  hint: 'Drag the map. Look through the lens.',
  places: [
    { x: 230, y: 300, name: 'The Coast of Late-Night Jazz', note: 'Where the music starts after midnight.', icon: 'note' },
    { x: 790, y: 270, name: 'The Observatory at the Edge of the Map', note: 'Clearest skies on record.', icon: 'scope' },
    { x: 800, y: 760, name: 'The Mountain Above the Clouds', note: 'You’ll want to remember the view.', icon: 'peak' },
    { x: 220, y: 860, name: 'The Café of Unpronounceable Things', note: 'Menu written in constellations. Order bravely.', icon: 'cup' },
    { x: 560, y: 1110, name: 'A City You’ll Get Lost In on Purpose', note: 'Wrong turns highly recommended.', icon: 'city' },
    { x: 870, y: 1170, name: 'Somewhere You Haven’t Imagined Yet', note: 'Coordinates unknown. Promising.', icon: 'q' },
  ],
  hidden: [
    { x: 600, y: 420, text: 'A space whale. Friendly. Probably.' },
    { x: 110, y: 1180, text: 'Here be dragons. (Unconfirmed.)' },
  ],
  message: ['There is still so much of the world waiting to surprise you.', 'And I have a feeling you’ll keep surprising yourself, too.'],
};

export const BECOMING = {
  hint: 'Brush the stardust from the glass.',
  message: [
    'You have so many things you want to achieve.',
    'I hope you achieve them.',
    'But I also hope you enjoy being the person who’s discovering how to get there.',
  ],
};

export const FRAGMENT_NAMES = {
  curiosity: 'Curiosity',
  creativity: 'Creativity',
  courage: 'Courage',
  passion: 'Passion',
  persistence: 'Persistence',
  possibility: 'Possibility',
};

export const CONSTELLATION = {
  intro: 'Along the way, you picked something up.',
  message: ['You were never missing the things you needed to begin.', 'Some of them were already there.', 'Others are still growing.'],
};

export const PLANET = {
  hint: 'Trace a circle around the planet.',
  letter: [
    'Happy 23rd Birthday.',
    'I wanted to make you something a little different.',
    'Something with music, stars, strange discoveries, and a few things that reminded me of you.',
    'I admire how curious you are, how passionate you get about the things you care about, and how much you want to do with your life.',
    'I hope you get to experience all those things you’re dreaming about. Even the ones that seem ridiculously far away right now.',
    'And I hope that along the way, you remember to appreciate the person who’s working toward them.',
    'Because there’s already quite a lot to appreciate.',
    'Happy birthday, future explorer.',
  ],
};

export const HOODIE = {
  gift: 'One last discovery remains.',
  upClose: 'Some things are meant to be discovered up close.',
  lookInside: 'look inside the hood',
};

export const FINALE = {
  title: 'Happy birthday, future explorer.',
  log: ['Mission status: complete.', 'Planets explored: all of them.', 'Most interesting discovery: the explorer.'],
};

/** Random Mission Control remarks sprinkled through the journey. */
export const QUIPS = {
  arrival: [
    'Mission status: suspiciously impressive.',
    'Scientific conclusion: more exploration required.',
    'Navigation nominal. Vibes excellent.',
  ],
  fragment: 'Something small and golden has attached itself to your ship.',
};
