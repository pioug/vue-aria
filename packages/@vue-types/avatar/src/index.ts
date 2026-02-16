import type { DOMProps, StyleProps } from "@vue-types/shared";

export interface AvatarProps {
  /**
   * Text description of the avatar.
   *
   * @default null
   */
  alt?: string,
  /**
   * The image URL for the avatar.
   */
  src: string
}

export interface SpectrumAvatarProps extends AvatarProps, DOMProps, Omit<StyleProps, "width" | "height"> {
  /**
   * Whether the avatar is disabled.
   */
  isDisabled?: boolean,
  /**
   * Size of the avatar. Affects both height and width.
   *
   * @default avatar-size-100
   */
  size?:
    | "avatar-size-50"
    | "avatar-size-75"
    | "avatar-size-100"
    | "avatar-size-200"
    | "avatar-size-300"
    | "avatar-size-400"
    | "avatar-size-500"
    | "avatar-size-600"
    | "avatar-size-700"
    | (string & {})
    | number
}
