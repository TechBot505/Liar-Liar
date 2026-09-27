import type { Question } from "../types";

export const questions: Question[] = [
  { id: "laws:001", prompt: "Since 1992, it has been illegal to import or sell ____ in Singapore.", answer: "chewing gum", alts: ["gum"], note: "You can chew it -- just not buy or sell it. Blame jammed subway doors." },
  { id: "laws:002", prompt: "Under the UK's Salmon Act 1986, it is illegal to handle a ____ in suspicious circumstances.", answer: "salmon", note: "\"Handling salmon in suspicious circumstances\" is a genuine British offence." },
  { id: "laws:003", prompt: "Germany's 1516 beer purity law said beer could contain only water, barley and ____.", answer: "hops", note: "The Reinheitsgebot left yeast off the list -- nobody knew it existed yet." },
  { id: "laws:004", prompt: "Sardinia's banned cheese casu martzu is deliberately made to contain live ____.", answer: "maggots", alts: ["fly larvae", "larvae"], note: "The maggots can jump as you eat. The EU banned selling it.", adult: true },
  { id: "laws:005", prompt: "In 1932, the Australian Army deployed machine guns in a losing \"war\" against ____.", answer: "emus", alts: ["emu"], note: "The emus scattered and won. The army retreated twice." },
  { id: "laws:006", prompt: "In France, it is legal to marry someone who is ____.", answer: "dead", alts: ["deceased"], note: "Posthumous marriage is in the Civil Code -- you need presidential approval." },
  { id: "laws:007", prompt: "In 897 AD, Pope Stephen VI put the rotting corpse of a former ____ on trial.", answer: "pope", alts: ["Pope Formosus"], note: "The Cadaver Synod: they propped up the dead pope and found him guilty." },
  { id: "laws:008", prompt: "The 1967 Outer Space Treaty bans placing ____ in orbit around Earth.", answer: "nuclear weapons", alts: ["nukes", "weapons of mass destruction"], note: "You can't park a nuke in space -- conventional weapons aren't fully covered." },
  { id: "laws:009", prompt: "In 1994, a woman won a famous US lawsuit against McDonald's after spilling ____.", answer: "coffee", alts: ["hot coffee"], note: "Stella Liebeck suffered third-degree burns; the coffee was near boiling." },
  { id: "laws:010", prompt: "A man sued Pepsi in the 1990s trying to redeem points for a ____.", answer: "Harrier jet", alts: ["fighter jet", "jet", "Harrier"], note: "An ad joked \"7,000,000 points = a jet.\" The court was not amused." },
  { id: "laws:011", prompt: "In 2007, a Washington DC judge sued his dry cleaner for $54 million over lost ____.", answer: "pants", alts: ["trousers"], note: "He lost. The cleaner's \"Satisfaction Guaranteed\" sign was the trigger." },
  { id: "laws:012", prompt: "A long copyright fight erupted over selfie photos taken by a ____.", answer: "monkey", alts: ["macaque", "crested macaque"], note: "A US court ruled animals can't hold copyright -- so nobody owns it." },
  { id: "laws:013", prompt: "In 1976, eight equatorial nations signed a declaration trying to claim part of ____.", answer: "space", alts: ["outer space", "geostationary orbit", "orbit"], note: "They wanted the geostationary orbit above them. It went nowhere." },
  { id: "laws:014", prompt: "In Iceland, a government committee must approve every new baby ____.", answer: "name", alts: ["first name", "given name"], note: "Names must fit Icelandic grammar and take the language's declensions." },
  { id: "laws:015", prompt: "In Thailand, it is a serious crime to insult or defame the ____.", answer: "king", alts: ["monarch", "royal family"], note: "Lese-majeste means 3-15 years per count; even stepping on money can qualify." },
  { id: "laws:016", prompt: "Kinder Surprise chocolate eggs are banned in the US because they hide a ____ inside.", answer: "toy", alts: ["non-nutritive object", "capsule"], note: "A 1938 law bans candy with a \"non-nutritive object\" embedded in it." },
  { id: "laws:017", prompt: "Absinthe, banned in the US from 1912 to 2007, is flavoured with ____.", answer: "wormwood", note: "Blamed for madness; the ban lifted once its thujone was shown to be low." },
  { id: "laws:018", prompt: "In 1919, a wave of Boston lawsuits followed a deadly flood of ____.", answer: "molasses", alts: ["treacle"], note: "A burst tank sent a 25-foot wave through the North End; 21 people died." },
  { id: "laws:019", prompt: "In 2005, a woman was jailed for faking that she found a ____ in Wendy's chili.", answer: "finger", alts: ["severed finger", "human finger"], note: "The finger belonged to a friend of her husband. She got nine years.", adult: true },
];
