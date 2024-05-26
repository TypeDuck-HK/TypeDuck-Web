import { forwardRef } from "react";

import { LANGUAGE_CODES } from "./consts";
import { letSome } from "./utils";

import type CandidateInfo from "./CandidateInfo";
import type { InterfacePreferences } from "./types";

const DictionaryPanel = forwardRef<HTMLDivElement, { info: CandidateInfo; prefs: InterfacePreferences }>(function DictionaryPanel({ info, prefs }, ref) {
	return info.hasDictionaryEntry(prefs) && <div className="dictionary-panel" ref={ref}>
		{info.entries.flatMap((entry, index) =>
			entry.isDictionaryEntry(prefs)
				? [
					<div key={index} className="dictionary-entry">
						{letSome(
							[entry.honzi, entry.jyutping, entry.pronunciationType],
							(honzi, jyutping, pronunciationType) =>
								<div className="entry-head">
									{honzi && <span className={`${prefs.isHeiTypeface ? "font-kai-fallback-hei" : "font-kai-fallback-sung"} text-[32pt] whitespace-nowrap`}>{honzi}</span>}
									{jyutping && <span className="text-[15pt] text-primary-content-300 whitespace-nowrap">{jyutping}</span>}
									{pronunciationType && <span className="text-primary-content-300 whitespace-nowrap">{pronunciationType}</span>}
								</div>,
						)}
						{letSome(
							[entry.formattedPartsOfSpeech, entry.formattedRegister, entry.formattedLabels, entry.properties.definition[prefs.mainLanguage]],
							(partsOfSpeech, register, labels, mainDefinition) =>
								<div className="entry-body">
									{partsOfSpeech?.map((partOfSpeech, i) => <span key={i} className="pos">{partOfSpeech}</span>)}
									{register && <span className="text-primary-content-300 italic whitespace-nowrap">{register}</span>}
									{labels?.map((label, i) => <span key={i} className="lbl">{label}</span>)}
									{mainDefinition && <span className="definition" lang={LANGUAGE_CODES[prefs.mainLanguage]}>{mainDefinition}</span>}
								</div>,
						)}
						{letSome(
							[entry.otherData],
							otherData =>
								<table>
									{otherData?.map(([key, name, value]) =>
										<tr key={key}>
											<th>{name}</th>
											<td className={prefs.isHeiTypeface ? "font-hei" : "font-sung"}>
												{value.split("，").map((line, i) => <div key={i}>{line}</div>)}
											</td>
										</tr>
									)}
								</table>,
						)}
						{letSome(
							[entry.otherLanguages(prefs)],
							otherDefinitions =>
								<table>
									<caption className="font-medium text-[13pt] pb-1 text-left whitespace-nowrap">More Languages</caption>
									{otherDefinitions?.map(([lang, name, value]) =>
										<tr key={lang}>
											<th>{name}</th>
											<td lang={lang}>{value}</td>
										</tr>
									)}
								</table>,
						)}
					</div>,
				]
				: []
		)}
	</div>;
});

export default DictionaryPanel;
