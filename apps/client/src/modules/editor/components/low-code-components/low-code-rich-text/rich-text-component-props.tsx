import {
  type IRichTextComponentProps,
  fillComponentPropsByConfig,
  richTextComponentDefaultConfig,
} from "@codigo/materials";
import { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { useEditorComponents } from "@/modules/editor/hooks";

export default function richTextComponentProps(
  _props: IRichTextComponentProps,
) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, richTextComponentDefaultConfig);
  }, [_props]);
  const { updateCurrentComponent } = useEditorComponents();
  const [value, setValue] = useState(props.content.value || "");

  useEffect(() => {
    setValue(props.content.value || "");
  }, [props.content.value]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    updateCurrentComponent({ content: newValue });
  };

  return (
    <div className="flex items-center justify-center">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder="请输入内容"
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, 4, false] }, "bold", "italic", "underline"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ font: [] }],
            ["code-block"],
          ],
        }}
        className="w-full"
      />
    </div>
  );
}
