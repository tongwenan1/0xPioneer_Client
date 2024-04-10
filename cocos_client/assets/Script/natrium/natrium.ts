// natrium
// license : MIT
// author : Sean Chen

import { inatrium } from "./interface/inatrium";
import { natrium_nodeimpl } from "./_node_implements/natrium_nodeimpl";

export const nat: inatrium = natrium_nodeimpl.impl;
