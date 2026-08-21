type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <input
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-10 border rounded"
    />
  );
};