import { LANGUAGE_LABELS, SHOW_ROMANIZATION_LABELS, Language, ShowRomanization } from "./consts";
import { Radio, RadioCheckbox, Segment, Toggle } from "./Inputs";

import type { PreferencesWithSetter } from "./types";

export default function Preferences(prefs: PreferencesWithSetter) {
	function toggleDisplayLanguage(language: Language, checked: boolean) {
		const newDisplayLanguages = new Set(prefs.displayLanguages);
		newDisplayLanguages[checked ? "add" : "delete"](language);
		prefs.setDisplayLanguages(newDisplayLanguages);
	}
	return <section className="max-w-5xl lg:columns-2 m-auto">
		<h3 className="font-bold text-2xl mb-2">輸入法設定 IME Settings</h3>
		<ul>
			<li>
				<fieldset className="border border-base-300 rounded px-3">
					<legend className="text-xl text-base-content mb-1 px-2">顯示語言 Display Languages</legend>
					{(Object.entries(LANGUAGE_LABELS) as [Language, string][]).map(([language, label]) =>
						<RadioCheckbox
							key={language}
							name="mainLanguage"
							label={label}
							state={prefs.mainLanguage}
							setState={language => {
								prefs.setMainLanguage(language);
								toggleDisplayLanguage(language, true);
							}}
							value={language}
							checked={prefs.displayLanguages.has(language)}
							setChecked={checked => toggleDisplayLanguage(language, checked)} />
					)}
					<div className="text-base-content text-xl mt-1 mb-3 ml-3">⬑ 主要語言 Main Language</div>
				</fieldset>
			</li>
			<li>
				<div className="text-lg text-base-content-200 my-3">每頁候選詞數量 No. of Candidates Per Page</div>
				<div className="w-full mb-6">
					<input
						type="range"
						className="range range-primary range-sm"
						min="4"
						max="10"
						step="1"
						value={prefs.pageSize}
						onChange={event => prefs.setPageSize(+event.target.value)} />
					<div className="w-full flex justify-between text-xs px-2 select-none" aria-hidden>
						<span className="tick after:content-['4']">|</span>
						<span className="tick after:content-['5']">|</span>
						<span className="tick after:content-['6']">|</span>
						<span className="tick after:content-['7']">|</span>
						<span className="tick after:content-['8']">|</span>
						<span className="tick after:content-['9']">|</span>
						<span className="tick after:content-['10']">|</span>
					</div>
				</div>
			</li>
			<li>
				<div className="label gap-2">
					<span className="text-lg text-base-content-200">中文字體 Chinese Typeface</span>
					<div className="join">
						<Segment name="chineseTypeface" label="宋體 Sung" state={prefs.isHeiTypeface} setState={prefs.setIsHeiTypeface} value={false} />
						<Segment name="chineseTypeface" label="黑體 Hei" state={prefs.isHeiTypeface} setState={prefs.setIsHeiTypeface} value={true} />
					</div>
				</div>
			</li>
			<li>
				<fieldset className="border border-base-300 rounded px-3 pb-2 mb-1">
					<legend className="text-xl text-base-content my-2 px-2">候選詞粵拼 Candidates Jyutping</legend>
					{(Object.entries(SHOW_ROMANIZATION_LABELS) as [ShowRomanization, string][]).map(([value, label]) =>
						<Radio
							key={value}
							name="showRomanization"
							label={label}
							state={prefs.showRomanization}
							setState={prefs.setShowRomanization}
							value={value} />
					)}
				</fieldset>
			</li>
			<li>
				<Toggle label="自動完成 Auto-completion" checked={prefs.enableCompletion} setChecked={prefs.setEnableCompletion} />
			</li>
			<li>
				<Toggle label="自動校正 Auto-correction" checked={prefs.enableCorrection} setChecked={prefs.setEnableCorrection} />
			</li>
			<li>
				<Toggle label="自動組詞 Auto-composition" checked={prefs.enableSentence} setChecked={prefs.setEnableSentence} />
			</li>
			<li>
				<Toggle label="輸入記憶 Input Memory" checked={prefs.enableLearning} setChecked={prefs.setEnableLearning} />
			</li>
		</ul>
		<h3 className="font-bold text-xl my-2">反查設定 Reverse Lookup Settings</h3>
		<ul>
			<li>
				<Toggle label="顯示完整輸入碼 Show Full Input Code" checked={prefs.showReverseCode} setChecked={prefs.setShowReverseCode} />
			</li>
			<li>
				<div className="label gap-2">
					<span className="text-lg text-base-content-200">倉頡版本 Cangjie Version</span>
					<div className="join">
						<Segment name="cangjieVersion" label="三代 Version 3" state={prefs.isCangjie5} setState={prefs.setIsCangjie5} value={false} />
						<Segment name="cangjieVersion" label="五代 Version 5" state={prefs.isCangjie5} setState={prefs.setIsCangjie5} value={true} />
					</div>
				</div>
			</li>
		</ul>
	</section>;
}
