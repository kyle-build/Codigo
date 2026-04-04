import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface IAvatarComponentProps {
  id: string;
  name: string;
  url: string;
  size: number;
  shape: "circle" | "square";
  handleClicked: "open-url" | "none";
  link: string;
}

export type TAvatarComponentResult =
  TransformedComponentConfig<IAvatarComponentProps>;

export type TAvatarComponentConfig = TBasicComponentConfig<
  "avatar",
  IAvatarComponentProps
>;

export const defaultAvatarInfo: IAvatarComponentProps = {
  id: "",
  name: "头像",
  url: "https://c-ssl.dtstatic.com/uploads/blog/202307/03/V2SoGOO7tmBvpYq.thumb.400_0.jpeg",
  size: 40,
  shape: "circle",
  handleClicked: "none",
  link: "",
};

export const avatarComponentDefaultConfig: TAvatarComponentResult = {
  id: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  name: {
    value: "头像",
    defaultValue: "头像",
    isHidden: false,
  },
  url: {
    value:
      "https://c-ssl.dtstatic.com/uploads/blog/202307/03/V2SoGOO7tmBvpYq.thumb.400_0.jpeg",
    defaultValue:
      "https://c-ssl.dtstatic.com/uploads/blog/202307/03/V2SoGOO7tmBvpYq.thumb.400_0.jpeg",
    isHidden: false,
  },
  size: {
    value: 40,
    defaultValue: 40,
    isHidden: false,
  },
  shape: {
    value: "circle",
    defaultValue: "circle",
    isHidden: false,
  },
  handleClicked: {
    value: "none",
    defaultValue: "none",
    isHidden: false,
  },
  link: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
};
