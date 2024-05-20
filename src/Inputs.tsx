import { NO_AUTO_FILL } from "./consts";

import type { Dispatch } from "react";

interface CheckboxProps {
	label: string;
	checked: boolean;
	setChecked: Dispatch<boolean>;
}

interface RadioProps<T> {
	name: string;
	label: string;
	state: T;
	setState: Dispatch<T>;
	value: T;
}

export function Toggle({ label, checked, setChecked }: CheckboxProps) {
	return <label className="cursor-pointer label gap-2">
		<span className="text-lg text-base-content-200 flex-1">{label}</span>
		<input
			type="checkbox"
			className="toggle toggle-primary"
			{...NO_AUTO_FILL}
			checked={checked}
			onChange={event => setChecked(event.target.checked)} />
	</label>;
}

export function Radio<T>({ name, label, state, setState, value }: RadioProps<T>) {
	return <label className="cursor-pointer label gap-2">
		<input
			type="radio"
			name={name}
			className="radio radio-primary"
			{...NO_AUTO_FILL}
			checked={state === value}
			onChange={() => setState(value)} />
		<span className="text-lg text-base-content-200 flex-1">{label}</span>
	</label>;
}

export function Segment<T>({ name, label, state, setState, value }: RadioProps<T>) {
	return <label className={`btn btn-outline btn-primary btn-sm join-item${state === value ? " btn-active" : ""}`}>
		<input
			type="radio"
			className="sr-only"
			name={name}
			{...NO_AUTO_FILL}
			checked={state === value}
			onChange={() => setState(value)} />
		{label}
	</label>;
}

export function RadioCheckbox<T>({ name, label, state, setState, value, checked, setChecked }: RadioProps<T> & CheckboxProps) {
	return <div className="label gap-2">
		<input
			type="radio"
			name={name}
			className="radio radio-primary"
			{...NO_AUTO_FILL}
			checked={state === value}
			onChange={() => setState(value)} />
		<label className="cursor-pointer contents">
			<span className="text-lg text-base-content-200 flex-1">{label}</span>
			<input
				type="checkbox"
				className="checkbox checkbox-primary"
				{...NO_AUTO_FILL}
				checked={checked}
				onChange={event => setChecked(event.target.checked)} />
		</label>
	</div>;
}
