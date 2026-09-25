'use strict';
export const validateDeviceToApp = validate20;
const schema31 = {
  $id: 'https://schema.serialdash.dev/v1/device-to-app.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'SerialDash protocol v1 — device to app',
  description:
    "Validates the JSON payload of a device→app protocol line, i.e. everything after the leading `@` (SPEC.md §3.3). A line whose `t` is not one of these is a message type unknown to v1: PRT-05 requires the app to ignore it rather than reject it, so it is intentionally outside this schema's `oneOf`.",
  $defs: {
    channelValue: {
      description:
        "Forms a channel value may take (§3.3 `d`). anyOf, not oneOf: e.g. a 2-number array is a valid 'xy pair' and a valid 'array of numbers' at once — which one it means depends on the consuming widget, not on the JSON shape.",
      anyOf: [
        { type: 'number' },
        { type: 'boolean' },
        { type: 'string' },
        { type: 'null' },
        {
          type: 'array',
          prefixItems: [{ type: 'number' }, { type: 'number' }],
          items: false,
          minItems: 2,
          maxItems: 2,
          description: '[x, y] pair (xy, polar).',
        },
        {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of numbers (heat, bar spectrum).',
        },
        {
          type: 'object',
          additionalProperties: { oneOf: [{ type: 'number' }, { type: 'string' }] },
          description: 'label → number|string map (pie, bar, table).',
        },
      ],
    },
    hi: {
      type: 'object',
      properties: {
        t: { const: 'hi' },
        v: { type: 'integer', minimum: 1 },
        name: { type: 'string', maxLength: 32 },
        fw: { type: 'string', maxLength: 16 },
        board: { type: 'string', maxLength: 16 },
        rx: { type: 'integer', exclusiveMinimum: 0 },
      },
      required: ['t', 'v', 'name'],
    },
    w: {
      description:
        'Widget declaration. The exact shape depends on `k` (SPEC.md §4); see /protocol/schema/widgets/*.schema.json.',
      oneOf: [
        { $ref: 'widgets/line.schema.json' },
        { $ref: 'widgets/value.schema.json' },
        { $ref: 'widgets/gauge.schema.json' },
        { $ref: 'widgets/led.schema.json' },
        { $ref: 'widgets/log.schema.json' },
        { $ref: 'widgets/xy.schema.json' },
        { $ref: 'widgets/bar.schema.json' },
        { $ref: 'widgets/pie.schema.json' },
        { $ref: 'widgets/level.schema.json' },
        { $ref: 'widgets/table.schema.json' },
        { $ref: 'widgets/heat.schema.json' },
        { $ref: 'widgets/hist.schema.json' },
        { $ref: 'widgets/polar.schema.json' },
        { $ref: 'widgets/compass.schema.json' },
        { $ref: 'widgets/attitude.schema.json' },
        { $ref: 'widgets/button.schema.json' },
        { $ref: 'widgets/switch.schema.json' },
        { $ref: 'widgets/slider.schema.json' },
        { $ref: 'widgets/number.schema.json' },
        { $ref: 'widgets/select.schema.json' },
        { $ref: 'widgets/text.schema.json' },
        { $ref: 'widgets/color.schema.json' },
      ],
    },
    u: {
      description:
        'Partial update: shallow-merges the given fields into the existing widget. `id` and `k` are not modifiable.',
      type: 'object',
      properties: {
        t: { const: 'u' },
        id: { $ref: 'widgets/common.schema.json#/$defs/identifier' },
      },
      not: { properties: { k: {} }, required: ['k'] },
      required: ['t', 'id'],
    },
    x: {
      type: 'object',
      properties: {
        t: { const: 'x' },
        id: { $ref: 'widgets/common.schema.json#/$defs/identifier' },
      },
      required: ['t'],
    },
    d: {
      type: 'object',
      properties: {
        t: { const: 'd' },
        d: { type: 'object', additionalProperties: { $ref: '#/$defs/channelValue' } },
        ts: { type: 'integer', minimum: 0 },
      },
      required: ['t', 'd'],
    },
    e: {
      type: 'object',
      properties: {
        t: { const: 'e' },
        lvl: { enum: ['debug', 'info', 'warn', 'err'] },
        msg: { type: 'string' },
        src: { type: 'string', maxLength: 16 },
      },
      required: ['t', 'msg'],
    },
    ack: {
      type: 'object',
      properties: {
        t: { const: 'ack' },
        r: { type: 'integer', minimum: 1, maximum: 65535 },
        ok: { type: 'boolean' },
        err: { type: 'string', maxLength: 48 },
      },
      required: ['t', 'r', 'ok'],
    },
    pong: {
      type: 'object',
      properties: { t: { const: 'pong' }, r: { type: 'integer', minimum: 1, maximum: 65535 } },
      required: ['t', 'r'],
    },
  },
  oneOf: [
    { $ref: '#/$defs/hi' },
    { $ref: '#/$defs/w' },
    { $ref: '#/$defs/u' },
    { $ref: '#/$defs/x' },
    { $ref: '#/$defs/d' },
    { $ref: '#/$defs/e' },
    { $ref: '#/$defs/ack' },
    { $ref: '#/$defs/pong' },
  ],
};
const schema32 = {
  type: 'object',
  properties: {
    t: { const: 'hi' },
    v: { type: 'integer', minimum: 1 },
    name: { type: 'string', maxLength: 32 },
    fw: { type: 'string', maxLength: 16 },
    board: { type: 'string', maxLength: 16 },
    rx: { type: 'integer', exclusiveMinimum: 0 },
  },
  required: ['t', 'v', 'name'],
};
const schema148 = {
  type: 'object',
  properties: {
    t: { const: 'e' },
    lvl: { enum: ['debug', 'info', 'warn', 'err'] },
    msg: { type: 'string' },
    src: { type: 'string', maxLength: 16 },
  },
  required: ['t', 'msg'],
};
const schema149 = {
  type: 'object',
  properties: {
    t: { const: 'ack' },
    r: { type: 'integer', minimum: 1, maximum: 65535 },
    ok: { type: 'boolean' },
    err: { type: 'string', maxLength: 48 },
  },
  required: ['t', 'r', 'ok'],
};
const schema150 = {
  type: 'object',
  properties: { t: { const: 'pong' }, r: { type: 'integer', minimum: 1, maximum: 65535 } },
  required: ['t', 'r'],
};
const func1 = function ucs2length(str) {
  const len = str.length;
  let length = 0;
  let pos = 0;
  let value;
  while (pos < len) {
    length++;
    value = str.charCodeAt(pos++);
    if (value >= 0xd800 && value <= 0xdbff && pos < len) {
      // high surrogate, and there is a next character
      value = str.charCodeAt(pos);
      if ((value & 0xfc00) === 0xdc00) pos++; // low surrogate
    }
  }
  return length;
};
const schema33 = {
  description:
    'Widget declaration. The exact shape depends on `k` (SPEC.md §4); see /protocol/schema/widgets/*.schema.json.',
  oneOf: [
    { $ref: 'widgets/line.schema.json' },
    { $ref: 'widgets/value.schema.json' },
    { $ref: 'widgets/gauge.schema.json' },
    { $ref: 'widgets/led.schema.json' },
    { $ref: 'widgets/log.schema.json' },
    { $ref: 'widgets/xy.schema.json' },
    { $ref: 'widgets/bar.schema.json' },
    { $ref: 'widgets/pie.schema.json' },
    { $ref: 'widgets/level.schema.json' },
    { $ref: 'widgets/table.schema.json' },
    { $ref: 'widgets/heat.schema.json' },
    { $ref: 'widgets/hist.schema.json' },
    { $ref: 'widgets/polar.schema.json' },
    { $ref: 'widgets/compass.schema.json' },
    { $ref: 'widgets/attitude.schema.json' },
    { $ref: 'widgets/button.schema.json' },
    { $ref: 'widgets/switch.schema.json' },
    { $ref: 'widgets/slider.schema.json' },
    { $ref: 'widgets/number.schema.json' },
    { $ref: 'widgets/select.schema.json' },
    { $ref: 'widgets/text.schema.json' },
    { $ref: 'widgets/color.schema.json' },
  ],
};
const schema34 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/line.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: line',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'line' },
    min: { type: 'number' },
    max: { type: 'number' },
    win: {
      type: 'number',
      exclusiveMinimum: 0,
      description: 'Time window in seconds. Default 30.',
    },
    step: { type: 'boolean' },
    fill: { type: 'boolean' },
  },
  required: ['k'],
};
const schema36 = {
  description: 'Properties common to every widget declared with a `w` message (SPEC.md §3.3).',
  type: 'object',
  properties: {
    t: { const: 'w' },
    id: { $ref: '#/$defs/identifier' },
    k: { type: 'string' },
    title: { type: 'string', maxLength: 48 },
    ch: { $ref: '#/$defs/channels' },
    grp: { type: 'string', maxLength: 24 },
    ord: { type: 'integer' },
    size: {
      type: 'array',
      prefixItems: [
        { type: 'integer', minimum: 1, maximum: 12 },
        { type: 'integer', minimum: 1 },
      ],
      items: false,
      minItems: 2,
      maxItems: 2,
    },
    unit: { type: 'string', maxLength: 8 },
    dec: { type: 'integer', minimum: 0, maximum: 6 },
    labels: { type: 'array', items: { type: 'string' } },
    colors: { type: 'array', items: { $ref: '#/$defs/color' } },
    stale: {
      type: 'number',
      exclusiveMinimum: 0,
      description: 'Seconds before the widget is shown as stale (default 5, §4.1).',
    },
  },
  required: ['t', 'id', 'k'],
};
const schema37 = {
  type: 'string',
  pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$',
  description:
    'Widget or channel id (PRT-11). Widgets and channels have separate namespaces (PRT-12).',
};
const schema41 = { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', description: 'Color as #RRGGBB.' };
const pattern4 = new RegExp('^[A-Za-z_][A-Za-z0-9_.-]{0,15}$', 'u');
const pattern7 = new RegExp('^#[0-9A-Fa-f]{6}$', 'u');
const schema38 = {
  description:
    'Channels displayed by the widget (`ch`). A single id, or an array of ids for multi-channel widgets.',
  oneOf: [
    { $ref: '#/$defs/identifier' },
    { type: 'array', items: { $ref: '#/$defs/identifier' }, minItems: 1 },
  ],
};
function validate25(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate25.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (typeof data === 'string') {
    if (!pattern4.test(data)) {
      const err0 = {
        instancePath,
        schemaPath: '#/$defs/identifier/pattern',
        keyword: 'pattern',
        params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
        message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  } else {
    const err1 = {
      instancePath,
      schemaPath: '#/$defs/identifier/type',
      keyword: 'type',
      params: { type: 'string' },
      message: 'must be string',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs4 = errors;
  if (Array.isArray(data)) {
    if (data.length < 1) {
      const err2 = {
        instancePath,
        schemaPath: '#/oneOf/1/minItems',
        keyword: 'minItems',
        params: { limit: 1 },
        message: 'must NOT have fewer than 1 items',
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    const len0 = data.length;
    for (let i0 = 0; i0 < len0; i0++) {
      let data0 = data[i0];
      if (typeof data0 === 'string') {
        if (!pattern4.test(data0)) {
          const err3 = {
            instancePath: instancePath + '/' + i0,
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      } else {
        const err4 = {
          instancePath: instancePath + '/' + i0,
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: '#/oneOf/1/type',
      keyword: 'type',
      params: { type: 'array' },
      message: 'must be array',
    };
    if (vErrors === null) {
      vErrors = [err5];
    } else {
      vErrors.push(err5);
    }
    errors++;
  }
  var _valid0 = _errs4 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      var items0 = true;
    }
  }
  if (!valid0) {
    const err6 = {
      instancePath,
      schemaPath: '#/oneOf',
      keyword: 'oneOf',
      params: { passingSchemas: passing0 },
      message: 'must match exactly one schema in oneOf',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate25.errors = vErrors;
  evaluated0.items = items0;
  return errors === 0;
}
validate25.evaluated = { dynamicProps: false, dynamicItems: true };
function validate24(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate24.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate24.errors = vErrors;
  return errors === 0;
}
validate24.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate22(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/line.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate24(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('line' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'line' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.min !== undefined) {
      let data1 = data.min;
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err2 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data2 = data.max;
      if (!(typeof data2 == 'number' && isFinite(data2))) {
        const err3 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.win !== undefined) {
      let data3 = data.win;
      if (typeof data3 == 'number' && isFinite(data3)) {
        if (data3 <= 0 || isNaN(data3)) {
          const err4 = {
            instancePath: instancePath + '/win',
            schemaPath: '#/properties/win/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/win',
          schemaPath: '#/properties/win/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.step !== undefined) {
      if (typeof data.step !== 'boolean') {
        const err6 = {
          instancePath: instancePath + '/step',
          schemaPath: '#/properties/step/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.fill !== undefined) {
      if (typeof data.fill !== 'boolean') {
        const err7 = {
          instancePath: instancePath + '/fill',
          schemaPath: '#/properties/fill/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = {
  props: {
    k: true,
    min: true,
    max: true,
    win: true,
    step: true,
    fill: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema42 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/value.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: value',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'value' },
    trend: { type: 'boolean' },
    minmax: { type: 'boolean' },
    warn: {
      type: 'array',
      prefixItems: [{ type: 'number' }, { type: 'number' }],
      items: false,
      minItems: 2,
      maxItems: 2,
    },
    alarm: {
      type: 'array',
      prefixItems: [{ type: 'number' }, { type: 'number' }],
      items: false,
      minItems: 2,
      maxItems: 2,
    },
  },
  required: ['k'],
};
function validate30(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate30.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate30.errors = vErrors;
  return errors === 0;
}
validate30.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate29(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/value.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate29.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate30(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate30.errors : vErrors.concat(validate30.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('value' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'value' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.trend !== undefined) {
      if (typeof data.trend !== 'boolean') {
        const err2 = {
          instancePath: instancePath + '/trend',
          schemaPath: '#/properties/trend/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.minmax !== undefined) {
      if (typeof data.minmax !== 'boolean') {
        const err3 = {
          instancePath: instancePath + '/minmax',
          schemaPath: '#/properties/minmax/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.warn !== undefined) {
      let data3 = data.warn;
      if (Array.isArray(data3)) {
        if (data3.length > 2) {
          const err4 = {
            instancePath: instancePath + '/warn',
            schemaPath: '#/properties/warn/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data3.length < 2) {
          const err5 = {
            instancePath: instancePath + '/warn',
            schemaPath: '#/properties/warn/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        const len0 = data3.length;
        if (len0 > 0) {
          let data4 = data3[0];
          if (!(typeof data4 == 'number' && isFinite(data4))) {
            const err6 = {
              instancePath: instancePath + '/warn/0',
              schemaPath: '#/properties/warn/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'number' },
              message: 'must be number',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        if (len0 > 1) {
          let data5 = data3[1];
          if (!(typeof data5 == 'number' && isFinite(data5))) {
            const err7 = {
              instancePath: instancePath + '/warn/1',
              schemaPath: '#/properties/warn/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'number' },
              message: 'must be number',
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
        const len1 = data3.length;
        if (!(len1 <= 2)) {
          const err8 = {
            instancePath: instancePath + '/warn',
            schemaPath: '#/properties/warn/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/warn',
          schemaPath: '#/properties/warn/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.alarm !== undefined) {
      let data6 = data.alarm;
      if (Array.isArray(data6)) {
        if (data6.length > 2) {
          const err10 = {
            instancePath: instancePath + '/alarm',
            schemaPath: '#/properties/alarm/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data6.length < 2) {
          const err11 = {
            instancePath: instancePath + '/alarm',
            schemaPath: '#/properties/alarm/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        const len2 = data6.length;
        if (len2 > 0) {
          let data7 = data6[0];
          if (!(typeof data7 == 'number' && isFinite(data7))) {
            const err12 = {
              instancePath: instancePath + '/alarm/0',
              schemaPath: '#/properties/alarm/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'number' },
              message: 'must be number',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (len2 > 1) {
          let data8 = data6[1];
          if (!(typeof data8 == 'number' && isFinite(data8))) {
            const err13 = {
              instancePath: instancePath + '/alarm/1',
              schemaPath: '#/properties/alarm/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'number' },
              message: 'must be number',
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        const len3 = data6.length;
        if (!(len3 <= 2)) {
          const err14 = {
            instancePath: instancePath + '/alarm',
            schemaPath: '#/properties/alarm/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
      } else {
        const err15 = {
          instancePath: instancePath + '/alarm',
          schemaPath: '#/properties/alarm/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate29.errors = vErrors;
  return errors === 0;
}
validate29.evaluated = {
  props: {
    k: true,
    trend: true,
    minmax: true,
    warn: true,
    alarm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema46 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/gauge.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: gauge',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'gauge' },
    min: { type: 'number' },
    max: { type: 'number' },
    zones: { type: 'array', items: { $ref: 'common.schema.json#/$defs/zone' } },
  },
  required: ['k', 'min', 'max'],
};
function validate35(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate35.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate35.errors = vErrors;
  return errors === 0;
}
validate35.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema50 = {
  type: 'array',
  description: '[from, to, color] range used by gauge/level zones.',
  prefixItems: [{ type: 'number' }, { type: 'number' }, { $ref: '#/$defs/color' }],
  items: false,
  minItems: 3,
  maxItems: 3,
};
function validate38(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate38.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (Array.isArray(data)) {
    if (data.length > 3) {
      const err0 = {
        instancePath,
        schemaPath: '#/maxItems',
        keyword: 'maxItems',
        params: { limit: 3 },
        message: 'must NOT have more than 3 items',
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.length < 3) {
      const err1 = {
        instancePath,
        schemaPath: '#/minItems',
        keyword: 'minItems',
        params: { limit: 3 },
        message: 'must NOT have fewer than 3 items',
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    const len0 = data.length;
    if (len0 > 0) {
      let data0 = data[0];
      if (!(typeof data0 == 'number' && isFinite(data0))) {
        const err2 = {
          instancePath: instancePath + '/0',
          schemaPath: '#/prefixItems/0/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (len0 > 1) {
      let data1 = data[1];
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err3 = {
          instancePath: instancePath + '/1',
          schemaPath: '#/prefixItems/1/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (len0 > 2) {
      let data2 = data[2];
      if (typeof data2 === 'string') {
        if (!pattern7.test(data2)) {
          const err4 = {
            instancePath: instancePath + '/2',
            schemaPath: '#/$defs/color/pattern',
            keyword: 'pattern',
            params: { pattern: '^#[0-9A-Fa-f]{6}$' },
            message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/2',
          schemaPath: '#/$defs/color/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    const len1 = data.length;
    if (!(len1 <= 3)) {
      const err6 = {
        instancePath,
        schemaPath: '#/items',
        keyword: 'items',
        params: { limit: 3 },
        message: 'must NOT have more than 3 items',
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'array' },
      message: 'must be array',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate38.errors = vErrors;
  return errors === 0;
}
validate38.evaluated = { items: true, dynamicProps: false, dynamicItems: false };
function validate34(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/gauge.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate34.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate35(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.min === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'min' },
        message: "must have required property '" + 'min' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.max === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'max' },
        message: "must have required property '" + 'max' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('gauge' !== data.k) {
        const err3 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'gauge' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.min !== undefined) {
      let data1 = data.min;
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err4 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data2 = data.max;
      if (!(typeof data2 == 'number' && isFinite(data2))) {
        const err5 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.zones !== undefined) {
      let data3 = data.zones;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate38(data3[i0], {
              instancePath: instancePath + '/zones/' + i0,
              parentData: data3,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/zones',
          schemaPath: '#/properties/zones/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate34.errors = vErrors;
  return errors === 0;
}
validate34.evaluated = {
  props: {
    k: true,
    min: true,
    max: true,
    zones: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema52 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/led.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: led',
  type: 'object',
  description:
    'Either `on`/`off` colors (boolean values), or `states` mapping a raw value to [label, color].',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'led' },
    on: { $ref: 'common.schema.json#/$defs/color' },
    off: { $ref: 'common.schema.json#/$defs/color' },
    states: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        prefixItems: [{ type: 'string' }, { $ref: 'common.schema.json#/$defs/color' }],
        items: false,
        minItems: 2,
        maxItems: 2,
      },
    },
  },
  required: ['k'],
};
function validate42(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate42.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate42.errors = vErrors;
  return errors === 0;
}
validate42.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate41(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/led.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate41.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate42(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('led' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'led' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.on !== undefined) {
      let data1 = data.on;
      if (typeof data1 === 'string') {
        if (!pattern7.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/on',
            schemaPath: 'common.schema.json#/$defs/color/pattern',
            keyword: 'pattern',
            params: { pattern: '^#[0-9A-Fa-f]{6}$' },
            message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/on',
          schemaPath: 'common.schema.json#/$defs/color/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.off !== undefined) {
      let data2 = data.off;
      if (typeof data2 === 'string') {
        if (!pattern7.test(data2)) {
          const err4 = {
            instancePath: instancePath + '/off',
            schemaPath: 'common.schema.json#/$defs/color/pattern',
            keyword: 'pattern',
            params: { pattern: '^#[0-9A-Fa-f]{6}$' },
            message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/off',
          schemaPath: 'common.schema.json#/$defs/color/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.states !== undefined) {
      let data3 = data.states;
      if (data3 && typeof data3 == 'object' && !Array.isArray(data3)) {
        for (const key0 in data3) {
          let data4 = data3[key0];
          if (Array.isArray(data4)) {
            if (data4.length > 2) {
              const err6 = {
                instancePath:
                  instancePath + '/states/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                schemaPath: '#/properties/states/additionalProperties/maxItems',
                keyword: 'maxItems',
                params: { limit: 2 },
                message: 'must NOT have more than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data4.length < 2) {
              const err7 = {
                instancePath:
                  instancePath + '/states/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                schemaPath: '#/properties/states/additionalProperties/minItems',
                keyword: 'minItems',
                params: { limit: 2 },
                message: 'must NOT have fewer than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            const len0 = data4.length;
            if (len0 > 0) {
              if (typeof data4[0] !== 'string') {
                const err8 = {
                  instancePath:
                    instancePath +
                    '/states/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1') +
                    '/0',
                  schemaPath: '#/properties/states/additionalProperties/prefixItems/0/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (len0 > 1) {
              let data6 = data4[1];
              if (typeof data6 === 'string') {
                if (!pattern7.test(data6)) {
                  const err9 = {
                    instancePath:
                      instancePath +
                      '/states/' +
                      key0.replace(/~/g, '~0').replace(/\//g, '~1') +
                      '/1',
                    schemaPath: 'common.schema.json#/$defs/color/pattern',
                    keyword: 'pattern',
                    params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                    message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
                  };
                  if (vErrors === null) {
                    vErrors = [err9];
                  } else {
                    vErrors.push(err9);
                  }
                  errors++;
                }
              } else {
                const err10 = {
                  instancePath:
                    instancePath +
                    '/states/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1') +
                    '/1',
                  schemaPath: 'common.schema.json#/$defs/color/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            const len1 = data4.length;
            if (!(len1 <= 2)) {
              const err11 = {
                instancePath:
                  instancePath + '/states/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                schemaPath: '#/properties/states/additionalProperties/items',
                keyword: 'items',
                params: { limit: 2 },
                message: 'must NOT have more than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          } else {
            const err12 = {
              instancePath:
                instancePath + '/states/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/properties/states/additionalProperties/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
      } else {
        const err13 = {
          instancePath: instancePath + '/states',
          schemaPath: '#/properties/states/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate41.errors = vErrors;
  return errors === 0;
}
validate41.evaluated = {
  props: {
    k: true,
    on: true,
    off: true,
    states: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema59 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/log.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: log',
  type: 'object',
  description: 'Displays `e` events. Does not use `ch`.',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'log' },
    lvl: { enum: ['debug', 'info', 'warn', 'err'] },
    src: { type: 'array', items: { type: 'string', maxLength: 16 } },
    max: { type: 'integer', exclusiveMinimum: 0, description: 'Max rows kept. Default 500.' },
  },
  required: ['k'],
};
function validate47(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate47.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate47.errors = vErrors;
  return errors === 0;
}
validate47.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate46(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/log.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate46.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate47(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate47.errors : vErrors.concat(validate47.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('log' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'log' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.lvl !== undefined) {
      let data1 = data.lvl;
      if (!(data1 === 'debug' || data1 === 'info' || data1 === 'warn' || data1 === 'err')) {
        const err2 = {
          instancePath: instancePath + '/lvl',
          schemaPath: '#/properties/lvl/enum',
          keyword: 'enum',
          params: { allowedValues: schema59.properties.lvl.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.src !== undefined) {
      let data2 = data.src;
      if (Array.isArray(data2)) {
        const len0 = data2.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data3 = data2[i0];
          if (typeof data3 === 'string') {
            if (func1(data3) > 16) {
              const err3 = {
                instancePath: instancePath + '/src/' + i0,
                schemaPath: '#/properties/src/items/maxLength',
                keyword: 'maxLength',
                params: { limit: 16 },
                message: 'must NOT have more than 16 characters',
              };
              if (vErrors === null) {
                vErrors = [err3];
              } else {
                vErrors.push(err3);
              }
              errors++;
            }
          } else {
            const err4 = {
              instancePath: instancePath + '/src/' + i0,
              schemaPath: '#/properties/src/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/src',
          schemaPath: '#/properties/src/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data4 = data.max;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4) && isFinite(data4))) {
        const err6 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (typeof data4 == 'number' && isFinite(data4)) {
        if (data4 <= 0 || isNaN(data4)) {
          const err7 = {
            instancePath: instancePath + '/max',
            schemaPath: '#/properties/max/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate46.errors = vErrors;
  return errors === 0;
}
validate46.evaluated = {
  props: {
    k: true,
    lvl: true,
    src: true,
    max: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema63 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/xy.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: xy',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'xy' },
    xmin: { type: 'number' },
    xmax: { type: 'number' },
    ymin: { type: 'number' },
    ymax: { type: 'number' },
    trail: { type: 'integer', exclusiveMinimum: 0, description: 'Points kept. Default 500.' },
    mode: { enum: ['points', 'lines'] },
    xlabel: { type: 'string' },
    ylabel: { type: 'string' },
  },
  required: ['k'],
};
function validate52(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate52.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate52.errors = vErrors;
  return errors === 0;
}
validate52.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate51(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/xy.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate51.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate52(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('xy' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'xy' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.xmin !== undefined) {
      let data1 = data.xmin;
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err2 = {
          instancePath: instancePath + '/xmin',
          schemaPath: '#/properties/xmin/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.xmax !== undefined) {
      let data2 = data.xmax;
      if (!(typeof data2 == 'number' && isFinite(data2))) {
        const err3 = {
          instancePath: instancePath + '/xmax',
          schemaPath: '#/properties/xmax/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.ymin !== undefined) {
      let data3 = data.ymin;
      if (!(typeof data3 == 'number' && isFinite(data3))) {
        const err4 = {
          instancePath: instancePath + '/ymin',
          schemaPath: '#/properties/ymin/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.ymax !== undefined) {
      let data4 = data.ymax;
      if (!(typeof data4 == 'number' && isFinite(data4))) {
        const err5 = {
          instancePath: instancePath + '/ymax',
          schemaPath: '#/properties/ymax/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.trail !== undefined) {
      let data5 = data.trail;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
        const err6 = {
          instancePath: instancePath + '/trail',
          schemaPath: '#/properties/trail/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (typeof data5 == 'number' && isFinite(data5)) {
        if (data5 <= 0 || isNaN(data5)) {
          const err7 = {
            instancePath: instancePath + '/trail',
            schemaPath: '#/properties/trail/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
    }
    if (data.mode !== undefined) {
      let data6 = data.mode;
      if (!(data6 === 'points' || data6 === 'lines')) {
        const err8 = {
          instancePath: instancePath + '/mode',
          schemaPath: '#/properties/mode/enum',
          keyword: 'enum',
          params: { allowedValues: schema63.properties.mode.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.xlabel !== undefined) {
      if (typeof data.xlabel !== 'string') {
        const err9 = {
          instancePath: instancePath + '/xlabel',
          schemaPath: '#/properties/xlabel/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.ylabel !== undefined) {
      if (typeof data.ylabel !== 'string') {
        const err10 = {
          instancePath: instancePath + '/ylabel',
          schemaPath: '#/properties/ylabel/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
  } else {
    const err11 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err11];
    } else {
      vErrors.push(err11);
    }
    errors++;
  }
  validate51.errors = vErrors;
  return errors === 0;
}
validate51.evaluated = {
  props: {
    k: true,
    xmin: true,
    xmax: true,
    ymin: true,
    ymax: true,
    trail: true,
    mode: true,
    xlabel: true,
    ylabel: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema67 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/bar.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: bar',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'bar' },
    min: { type: 'number' },
    max: { type: 'number' },
    horiz: { type: 'boolean' },
    xlabels: { type: 'array', items: { type: 'string' } },
  },
  required: ['k'],
};
function validate57(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate57.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate57.errors = vErrors;
  return errors === 0;
}
validate57.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate56(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/bar.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate56.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate57(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate57.errors : vErrors.concat(validate57.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('bar' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'bar' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.min !== undefined) {
      let data1 = data.min;
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err2 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data2 = data.max;
      if (!(typeof data2 == 'number' && isFinite(data2))) {
        const err3 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.horiz !== undefined) {
      if (typeof data.horiz !== 'boolean') {
        const err4 = {
          instancePath: instancePath + '/horiz',
          schemaPath: '#/properties/horiz/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.xlabels !== undefined) {
      let data4 = data.xlabels;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data4[i0] !== 'string') {
            const err5 = {
              instancePath: instancePath + '/xlabels/' + i0,
              schemaPath: '#/properties/xlabels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/xlabels',
          schemaPath: '#/properties/xlabels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate56.errors = vErrors;
  return errors === 0;
}
validate56.evaluated = {
  props: {
    k: true,
    min: true,
    max: true,
    horiz: true,
    xlabels: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema71 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/pie.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: pie',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: { k: { const: 'pie' }, donut: { type: 'boolean' }, pct: { type: 'boolean' } },
  required: ['k'],
};
function validate62(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate62.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate62.errors = vErrors;
  return errors === 0;
}
validate62.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate61(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/pie.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate61.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate62(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate62.errors : vErrors.concat(validate62.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('pie' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'pie' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.donut !== undefined) {
      if (typeof data.donut !== 'boolean') {
        const err2 = {
          instancePath: instancePath + '/donut',
          schemaPath: '#/properties/donut/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.pct !== undefined) {
      if (typeof data.pct !== 'boolean') {
        const err3 = {
          instancePath: instancePath + '/pct',
          schemaPath: '#/properties/pct/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  }
  validate61.errors = vErrors;
  return errors === 0;
}
validate61.evaluated = {
  props: {
    k: true,
    donut: true,
    pct: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema75 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/level.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: level',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'level' },
    min: { type: 'number' },
    max: { type: 'number' },
    vert: { type: 'boolean' },
    zones: { type: 'array', items: { $ref: 'common.schema.json#/$defs/zone' } },
  },
  required: ['k'],
};
function validate67(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate67.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate67.errors = vErrors;
  return errors === 0;
}
validate67.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate70(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate70.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (Array.isArray(data)) {
    if (data.length > 3) {
      const err0 = {
        instancePath,
        schemaPath: '#/maxItems',
        keyword: 'maxItems',
        params: { limit: 3 },
        message: 'must NOT have more than 3 items',
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.length < 3) {
      const err1 = {
        instancePath,
        schemaPath: '#/minItems',
        keyword: 'minItems',
        params: { limit: 3 },
        message: 'must NOT have fewer than 3 items',
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    const len0 = data.length;
    if (len0 > 0) {
      let data0 = data[0];
      if (!(typeof data0 == 'number' && isFinite(data0))) {
        const err2 = {
          instancePath: instancePath + '/0',
          schemaPath: '#/prefixItems/0/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (len0 > 1) {
      let data1 = data[1];
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err3 = {
          instancePath: instancePath + '/1',
          schemaPath: '#/prefixItems/1/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (len0 > 2) {
      let data2 = data[2];
      if (typeof data2 === 'string') {
        if (!pattern7.test(data2)) {
          const err4 = {
            instancePath: instancePath + '/2',
            schemaPath: '#/$defs/color/pattern',
            keyword: 'pattern',
            params: { pattern: '^#[0-9A-Fa-f]{6}$' },
            message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/2',
          schemaPath: '#/$defs/color/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    const len1 = data.length;
    if (!(len1 <= 3)) {
      const err6 = {
        instancePath,
        schemaPath: '#/items',
        keyword: 'items',
        params: { limit: 3 },
        message: 'must NOT have more than 3 items',
      };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'array' },
      message: 'must be array',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate70.errors = vErrors;
  return errors === 0;
}
validate70.evaluated = { items: true, dynamicProps: false, dynamicItems: false };
function validate66(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/level.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate66.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate67(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate67.errors : vErrors.concat(validate67.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('level' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'level' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.min !== undefined) {
      let data1 = data.min;
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err2 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data2 = data.max;
      if (!(typeof data2 == 'number' && isFinite(data2))) {
        const err3 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.vert !== undefined) {
      if (typeof data.vert !== 'boolean') {
        const err4 = {
          instancePath: instancePath + '/vert',
          schemaPath: '#/properties/vert/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.zones !== undefined) {
      let data4 = data.zones;
      if (Array.isArray(data4)) {
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate70(data4[i0], {
              instancePath: instancePath + '/zones/' + i0,
              parentData: data4,
              parentDataProperty: i0,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate70.errors : vErrors.concat(validate70.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/zones',
          schemaPath: '#/properties/zones/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  validate66.errors = vErrors;
  return errors === 0;
}
validate66.evaluated = {
  props: {
    k: true,
    min: true,
    max: true,
    vert: true,
    zones: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema81 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/table.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: table',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: { k: { const: 'table' }, cols: { type: 'array', items: { type: 'string' } } },
  required: ['k'],
};
function validate74(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate74.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate74.errors = vErrors;
  return errors === 0;
}
validate74.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate73(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/table.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate73.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate74(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('table' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'table' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.cols !== undefined) {
      let data1 = data.cols;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data1[i0] !== 'string') {
            const err2 = {
              instancePath: instancePath + '/cols/' + i0,
              schemaPath: '#/properties/cols/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }
            errors++;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/cols',
          schemaPath: '#/properties/cols/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  }
  validate73.errors = vErrors;
  return errors === 0;
}
validate73.evaluated = {
  props: {
    k: true,
    cols: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema85 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/heat.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: heat',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'heat' },
    rows: { type: 'integer', exclusiveMinimum: 0 },
    cols: { type: 'integer', exclusiveMinimum: 0 },
    min: { type: 'number' },
    max: { type: 'number' },
    palette: { enum: ['thermal', 'viridis', 'gray'] },
    interp: { type: 'boolean' },
  },
  required: ['k', 'rows', 'cols'],
};
function validate79(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate79.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate79.errors = vErrors;
  return errors === 0;
}
validate79.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate78(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/heat.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate78.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate79(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate79.errors : vErrors.concat(validate79.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.rows === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'rows' },
        message: "must have required property '" + 'rows' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.cols === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'cols' },
        message: "must have required property '" + 'cols' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('heat' !== data.k) {
        const err3 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'heat' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.rows !== undefined) {
      let data1 = data.rows;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
        const err4 = {
          instancePath: instancePath + '/rows',
          schemaPath: '#/properties/rows/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (typeof data1 == 'number' && isFinite(data1)) {
        if (data1 <= 0 || isNaN(data1)) {
          const err5 = {
            instancePath: instancePath + '/rows',
            schemaPath: '#/properties/rows/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
    }
    if (data.cols !== undefined) {
      let data2 = data.cols;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
        const err6 = {
          instancePath: instancePath + '/cols',
          schemaPath: '#/properties/cols/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (typeof data2 == 'number' && isFinite(data2)) {
        if (data2 <= 0 || isNaN(data2)) {
          const err7 = {
            instancePath: instancePath + '/cols',
            schemaPath: '#/properties/cols/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
    }
    if (data.min !== undefined) {
      let data3 = data.min;
      if (!(typeof data3 == 'number' && isFinite(data3))) {
        const err8 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data4 = data.max;
      if (!(typeof data4 == 'number' && isFinite(data4))) {
        const err9 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.palette !== undefined) {
      let data5 = data.palette;
      if (!(data5 === 'thermal' || data5 === 'viridis' || data5 === 'gray')) {
        const err10 = {
          instancePath: instancePath + '/palette',
          schemaPath: '#/properties/palette/enum',
          keyword: 'enum',
          params: { allowedValues: schema85.properties.palette.enum },
          message: 'must be equal to one of the allowed values',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.interp !== undefined) {
      if (typeof data.interp !== 'boolean') {
        const err11 = {
          instancePath: instancePath + '/interp',
          schemaPath: '#/properties/interp/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate78.errors = vErrors;
  return errors === 0;
}
validate78.evaluated = {
  props: {
    k: true,
    rows: true,
    cols: true,
    min: true,
    max: true,
    palette: true,
    interp: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema89 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/hist.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: hist',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'hist' },
    bins: { type: 'integer', exclusiveMinimum: 0, description: 'Default 20.' },
    min: { type: 'number' },
    max: { type: 'number' },
    n: { type: 'integer', exclusiveMinimum: 0, description: 'Samples considered. Default 1000.' },
  },
  required: ['k'],
};
function validate84(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate84.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate84.errors = vErrors;
  return errors === 0;
}
validate84.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate83(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/hist.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate83.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate84(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate84.errors : vErrors.concat(validate84.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('hist' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'hist' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.bins !== undefined) {
      let data1 = data.bins;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
        const err2 = {
          instancePath: instancePath + '/bins',
          schemaPath: '#/properties/bins/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      if (typeof data1 == 'number' && isFinite(data1)) {
        if (data1 <= 0 || isNaN(data1)) {
          const err3 = {
            instancePath: instancePath + '/bins',
            schemaPath: '#/properties/bins/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
      }
    }
    if (data.min !== undefined) {
      let data2 = data.min;
      if (!(typeof data2 == 'number' && isFinite(data2))) {
        const err4 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data3 = data.max;
      if (!(typeof data3 == 'number' && isFinite(data3))) {
        const err5 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.n !== undefined) {
      let data4 = data.n;
      if (!(typeof data4 == 'number' && !(data4 % 1) && !isNaN(data4) && isFinite(data4))) {
        const err6 = {
          instancePath: instancePath + '/n',
          schemaPath: '#/properties/n/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
      if (typeof data4 == 'number' && isFinite(data4)) {
        if (data4 <= 0 || isNaN(data4)) {
          const err7 = {
            instancePath: instancePath + '/n',
            schemaPath: '#/properties/n/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate83.errors = vErrors;
  return errors === 0;
}
validate83.evaluated = {
  props: {
    k: true,
    bins: true,
    min: true,
    max: true,
    n: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema93 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/polar.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: polar',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'polar' },
    rmax: { type: 'number' },
    amin: { type: 'number', description: 'Sector start in degrees. Default 0.' },
    amax: { type: 'number', description: 'Sector end in degrees. Default 360.' },
    sweep: { type: 'boolean' },
  },
  required: ['k'],
};
function validate89(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate89.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate89.errors = vErrors;
  return errors === 0;
}
validate89.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate88(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/polar.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate88.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate89(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate89.errors : vErrors.concat(validate89.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('polar' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'polar' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.rmax !== undefined) {
      let data1 = data.rmax;
      if (!(typeof data1 == 'number' && isFinite(data1))) {
        const err2 = {
          instancePath: instancePath + '/rmax',
          schemaPath: '#/properties/rmax/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.amin !== undefined) {
      let data2 = data.amin;
      if (!(typeof data2 == 'number' && isFinite(data2))) {
        const err3 = {
          instancePath: instancePath + '/amin',
          schemaPath: '#/properties/amin/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.amax !== undefined) {
      let data3 = data.amax;
      if (!(typeof data3 == 'number' && isFinite(data3))) {
        const err4 = {
          instancePath: instancePath + '/amax',
          schemaPath: '#/properties/amax/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.sweep !== undefined) {
      if (typeof data.sweep !== 'boolean') {
        const err5 = {
          instancePath: instancePath + '/sweep',
          schemaPath: '#/properties/sweep/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
  } else {
    const err6 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err6];
    } else {
      vErrors.push(err6);
    }
    errors++;
  }
  validate88.errors = vErrors;
  return errors === 0;
}
validate88.evaluated = {
  props: {
    k: true,
    rmax: true,
    amin: true,
    amax: true,
    sweep: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema97 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/compass.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: compass',
  type: 'object',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: {
    k: { const: 'compass' },
    ref: {
      type: 'array',
      description: 'Localized cardinal point labels.',
      items: { type: 'string' },
    },
  },
  required: ['k'],
};
function validate94(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate94.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate94.errors = vErrors;
  return errors === 0;
}
validate94.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate93(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/compass.schema.json" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate93.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate94(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate94.errors : vErrors.concat(validate94.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('compass' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'compass' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.ref !== undefined) {
      let data1 = data.ref;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (typeof data1[i0] !== 'string') {
            const err2 = {
              instancePath: instancePath + '/ref/' + i0,
              schemaPath: '#/properties/ref/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }
            errors++;
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/ref',
          schemaPath: '#/properties/ref/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  }
  validate93.errors = vErrors;
  return errors === 0;
}
validate93.evaluated = {
  props: {
    k: true,
    ref: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema101 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/attitude.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: attitude',
  type: 'object',
  description:
    'Artificial horizon. Value is a [pitch, roll] pair in degrees. No specific properties.',
  allOf: [{ $ref: 'common.schema.json#/$defs/widgetBase' }],
  properties: { k: { const: 'attitude' } },
  required: ['k'],
};
function validate99(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate99.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate99.errors = vErrors;
  return errors === 0;
}
validate99.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate98(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/attitude.schema.json" */ let vErrors =
    null;
  let errors = 0;
  const evaluated0 = validate98.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate99(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate99.errors : vErrors.concat(validate99.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('attitude' !== data.k) {
        const err1 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'attitude' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate98.errors = vErrors;
  return errors === 0;
}
validate98.evaluated = {
  props: {
    k: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema105 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/button.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: button (control)',
  type: 'object',
  allOf: [
    { $ref: 'common.schema.json#/$defs/widgetBase' },
    { $ref: 'common.schema.json#/$defs/controlExtras' },
  ],
  properties: {
    k: { const: 'button' },
    hold: { type: 'boolean', description: 'Send true on press and false on release.' },
    label: { type: 'string' },
    color: { $ref: 'common.schema.json#/$defs/color' },
  },
  required: ['k'],
};
const schema109 = {
  description:
    'Properties added to controls on top of widgetBase (§4.3). `id` doubles as the state channel id (PRT-13), so `ch` is not used.',
  type: 'object',
  properties: {
    val: { description: 'Optional initial/confirmed value; type depends on the control (§3.6.1).' },
    dis: { type: 'boolean' },
    confirm: { type: 'string' },
  },
};
function validate104(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate104.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate104.errors = vErrors;
  return errors === 0;
}
validate104.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate103(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/button.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate103.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate104(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate104.errors : vErrors.concat(validate104.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dis !== undefined) {
      if (typeof data.dis !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/dis',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/dis/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.confirm !== undefined) {
      if (typeof data.confirm !== 'string') {
        const err1 = {
          instancePath: instancePath + '/confirm',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/confirm/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: 'common.schema.json#/$defs/controlExtras/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('button' !== data.k) {
        const err4 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'button' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.hold !== undefined) {
      if (typeof data.hold !== 'boolean') {
        const err5 = {
          instancePath: instancePath + '/hold',
          schemaPath: '#/properties/hold/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.label !== undefined) {
      if (typeof data.label !== 'string') {
        const err6 = {
          instancePath: instancePath + '/label',
          schemaPath: '#/properties/label/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.color !== undefined) {
      let data5 = data.color;
      if (typeof data5 === 'string') {
        if (!pattern7.test(data5)) {
          const err7 = {
            instancePath: instancePath + '/color',
            schemaPath: 'common.schema.json#/$defs/color/pattern',
            keyword: 'pattern',
            params: { pattern: '^#[0-9A-Fa-f]{6}$' },
            message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/color',
          schemaPath: 'common.schema.json#/$defs/color/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate103.errors = vErrors;
  return errors === 0;
}
validate103.evaluated = {
  props: {
    k: true,
    hold: true,
    label: true,
    color: true,
    val: true,
    dis: true,
    confirm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema111 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/switch.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: switch (control)',
  type: 'object',
  description:
    'Library builder method is `toggle()` because `switch` is a reserved C++ keyword (LIB-TX-01); the wire `k` stays "switch".',
  allOf: [
    { $ref: 'common.schema.json#/$defs/widgetBase' },
    { $ref: 'common.schema.json#/$defs/controlExtras' },
  ],
  properties: { k: { const: 'switch' }, on: { type: 'string' }, off: { type: 'string' } },
  required: ['k'],
};
function validate109(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate109.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate109.errors = vErrors;
  return errors === 0;
}
validate109.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate108(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/switch.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate108.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate109(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate109.errors : vErrors.concat(validate109.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dis !== undefined) {
      if (typeof data.dis !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/dis',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/dis/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.confirm !== undefined) {
      if (typeof data.confirm !== 'string') {
        const err1 = {
          instancePath: instancePath + '/confirm',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/confirm/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: 'common.schema.json#/$defs/controlExtras/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('switch' !== data.k) {
        const err4 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'switch' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.on !== undefined) {
      if (typeof data.on !== 'string') {
        const err5 = {
          instancePath: instancePath + '/on',
          schemaPath: '#/properties/on/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.off !== undefined) {
      if (typeof data.off !== 'string') {
        const err6 = {
          instancePath: instancePath + '/off',
          schemaPath: '#/properties/off/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate108.errors = vErrors;
  return errors === 0;
}
validate108.evaluated = {
  props: {
    k: true,
    on: true,
    off: true,
    val: true,
    dis: true,
    confirm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema116 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/slider.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: slider (control)',
  type: 'object',
  allOf: [
    { $ref: 'common.schema.json#/$defs/widgetBase' },
    { $ref: 'common.schema.json#/$defs/controlExtras' },
  ],
  properties: {
    k: { const: 'slider' },
    min: { type: 'number' },
    max: { type: 'number' },
    step: { type: 'number', exclusiveMinimum: 0, description: 'Default 1.' },
    vert: { type: 'boolean' },
  },
  required: ['k', 'min', 'max'],
};
function validate114(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate114.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate114.errors = vErrors;
  return errors === 0;
}
validate114.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate113(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/slider.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate113.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate114(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate114.errors : vErrors.concat(validate114.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dis !== undefined) {
      if (typeof data.dis !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/dis',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/dis/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.confirm !== undefined) {
      if (typeof data.confirm !== 'string') {
        const err1 = {
          instancePath: instancePath + '/confirm',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/confirm/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: 'common.schema.json#/$defs/controlExtras/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.min === undefined) {
      const err4 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'min' },
        message: "must have required property '" + 'min' + "'",
      };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.max === undefined) {
      const err5 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'max' },
        message: "must have required property '" + 'max' + "'",
      };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('slider' !== data.k) {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'slider' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.min !== undefined) {
      let data3 = data.min;
      if (!(typeof data3 == 'number' && isFinite(data3))) {
        const err7 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data4 = data.max;
      if (!(typeof data4 == 'number' && isFinite(data4))) {
        const err8 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.step !== undefined) {
      let data5 = data.step;
      if (typeof data5 == 'number' && isFinite(data5)) {
        if (data5 <= 0 || isNaN(data5)) {
          const err9 = {
            instancePath: instancePath + '/step',
            schemaPath: '#/properties/step/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/step',
          schemaPath: '#/properties/step/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.vert !== undefined) {
      if (typeof data.vert !== 'boolean') {
        const err11 = {
          instancePath: instancePath + '/vert',
          schemaPath: '#/properties/vert/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err12];
    } else {
      vErrors.push(err12);
    }
    errors++;
  }
  validate113.errors = vErrors;
  return errors === 0;
}
validate113.evaluated = {
  props: {
    k: true,
    min: true,
    max: true,
    step: true,
    vert: true,
    val: true,
    dis: true,
    confirm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema121 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/number.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: number (control)',
  type: 'object',
  allOf: [
    { $ref: 'common.schema.json#/$defs/widgetBase' },
    { $ref: 'common.schema.json#/$defs/controlExtras' },
  ],
  properties: {
    k: { const: 'number' },
    min: { type: 'number' },
    max: { type: 'number' },
    step: { type: 'number', exclusiveMinimum: 0 },
  },
  required: ['k'],
};
function validate119(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate119.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate119.errors = vErrors;
  return errors === 0;
}
validate119.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate118(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/number.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate118.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate119(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate119.errors : vErrors.concat(validate119.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dis !== undefined) {
      if (typeof data.dis !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/dis',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/dis/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.confirm !== undefined) {
      if (typeof data.confirm !== 'string') {
        const err1 = {
          instancePath: instancePath + '/confirm',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/confirm/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: 'common.schema.json#/$defs/controlExtras/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('number' !== data.k) {
        const err4 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'number' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.min !== undefined) {
      let data3 = data.min;
      if (!(typeof data3 == 'number' && isFinite(data3))) {
        const err5 = {
          instancePath: instancePath + '/min',
          schemaPath: '#/properties/min/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data4 = data.max;
      if (!(typeof data4 == 'number' && isFinite(data4))) {
        const err6 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.step !== undefined) {
      let data5 = data.step;
      if (typeof data5 == 'number' && isFinite(data5)) {
        if (data5 <= 0 || isNaN(data5)) {
          const err7 = {
            instancePath: instancePath + '/step',
            schemaPath: '#/properties/step/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/step',
          schemaPath: '#/properties/step/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
  } else {
    const err9 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err9];
    } else {
      vErrors.push(err9);
    }
    errors++;
  }
  validate118.errors = vErrors;
  return errors === 0;
}
validate118.evaluated = {
  props: {
    k: true,
    min: true,
    max: true,
    step: true,
    val: true,
    dis: true,
    confirm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema126 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/select.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: select (control)',
  type: 'object',
  allOf: [
    { $ref: 'common.schema.json#/$defs/widgetBase' },
    { $ref: 'common.schema.json#/$defs/controlExtras' },
  ],
  properties: {
    k: { const: 'select' },
    opts: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string' },
          {
            type: 'array',
            prefixItems: [{ type: 'string' }, { type: 'string' }],
            items: false,
            minItems: 2,
            maxItems: 2,
          },
        ],
      },
    },
  },
  required: ['k'],
};
function validate124(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate124.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate124.errors = vErrors;
  return errors === 0;
}
validate124.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate123(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/select.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate123.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate124(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate124.errors : vErrors.concat(validate124.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dis !== undefined) {
      if (typeof data.dis !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/dis',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/dis/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.confirm !== undefined) {
      if (typeof data.confirm !== 'string') {
        const err1 = {
          instancePath: instancePath + '/confirm',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/confirm/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: 'common.schema.json#/$defs/controlExtras/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('select' !== data.k) {
        const err4 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'select' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.opts !== undefined) {
      let data3 = data.opts;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          const _errs13 = errors;
          let valid6 = false;
          let passing0 = null;
          const _errs14 = errors;
          if (typeof data4 !== 'string') {
            const err5 = {
              instancePath: instancePath + '/opts/' + i0,
              schemaPath: '#/properties/opts/items/oneOf/0/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
          var _valid0 = _errs14 === errors;
          if (_valid0) {
            valid6 = true;
            passing0 = 0;
          }
          const _errs16 = errors;
          if (Array.isArray(data4)) {
            if (data4.length > 2) {
              const err6 = {
                instancePath: instancePath + '/opts/' + i0,
                schemaPath: '#/properties/opts/items/oneOf/1/maxItems',
                keyword: 'maxItems',
                params: { limit: 2 },
                message: 'must NOT have more than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data4.length < 2) {
              const err7 = {
                instancePath: instancePath + '/opts/' + i0,
                schemaPath: '#/properties/opts/items/oneOf/1/minItems',
                keyword: 'minItems',
                params: { limit: 2 },
                message: 'must NOT have fewer than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            const len1 = data4.length;
            if (len1 > 0) {
              if (typeof data4[0] !== 'string') {
                const err8 = {
                  instancePath: instancePath + '/opts/' + i0 + '/0',
                  schemaPath: '#/properties/opts/items/oneOf/1/prefixItems/0/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err8];
                } else {
                  vErrors.push(err8);
                }
                errors++;
              }
            }
            if (len1 > 1) {
              if (typeof data4[1] !== 'string') {
                const err9 = {
                  instancePath: instancePath + '/opts/' + i0 + '/1',
                  schemaPath: '#/properties/opts/items/oneOf/1/prefixItems/1/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            const len2 = data4.length;
            if (!(len2 <= 2)) {
              const err10 = {
                instancePath: instancePath + '/opts/' + i0,
                schemaPath: '#/properties/opts/items/oneOf/1/items',
                keyword: 'items',
                params: { limit: 2 },
                message: 'must NOT have more than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
          } else {
            const err11 = {
              instancePath: instancePath + '/opts/' + i0,
              schemaPath: '#/properties/opts/items/oneOf/1/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
          var _valid0 = _errs16 === errors;
          if (_valid0 && valid6) {
            valid6 = false;
            passing0 = [passing0, 1];
          } else {
            if (_valid0) {
              valid6 = true;
              passing0 = 1;
            }
          }
          if (!valid6) {
            const err12 = {
              instancePath: instancePath + '/opts/' + i0,
              schemaPath: '#/properties/opts/items/oneOf',
              keyword: 'oneOf',
              params: { passingSchemas: passing0 },
              message: 'must match exactly one schema in oneOf',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          } else {
            errors = _errs13;
            if (vErrors !== null) {
              if (_errs13) {
                vErrors.length = _errs13;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        const err13 = {
          instancePath: instancePath + '/opts',
          schemaPath: '#/properties/opts/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  validate123.errors = vErrors;
  return errors === 0;
}
validate123.evaluated = {
  props: {
    k: true,
    opts: true,
    val: true,
    dis: true,
    confirm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema131 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/text.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: text (control)',
  type: 'object',
  allOf: [
    { $ref: 'common.schema.json#/$defs/widgetBase' },
    { $ref: 'common.schema.json#/$defs/controlExtras' },
  ],
  properties: {
    k: { const: 'text' },
    max: {
      type: 'integer',
      exclusiveMinimum: 0,
      description: 'Max length, also bounded by rx (PRT-08).',
    },
    ph: { type: 'string' },
  },
  required: ['k'],
};
function validate129(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate129.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate129.errors = vErrors;
  return errors === 0;
}
validate129.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate128(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/text.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate128.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate129(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate129.errors : vErrors.concat(validate129.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dis !== undefined) {
      if (typeof data.dis !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/dis',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/dis/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.confirm !== undefined) {
      if (typeof data.confirm !== 'string') {
        const err1 = {
          instancePath: instancePath + '/confirm',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/confirm/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: 'common.schema.json#/$defs/controlExtras/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('text' !== data.k) {
        const err4 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'text' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.max !== undefined) {
      let data3 = data.max;
      if (!(typeof data3 == 'number' && !(data3 % 1) && !isNaN(data3) && isFinite(data3))) {
        const err5 = {
          instancePath: instancePath + '/max',
          schemaPath: '#/properties/max/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (typeof data3 == 'number' && isFinite(data3)) {
        if (data3 <= 0 || isNaN(data3)) {
          const err6 = {
            instancePath: instancePath + '/max',
            schemaPath: '#/properties/max/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      }
    }
    if (data.ph !== undefined) {
      if (typeof data.ph !== 'string') {
        const err7 = {
          instancePath: instancePath + '/ph',
          schemaPath: '#/properties/ph/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate128.errors = vErrors;
  return errors === 0;
}
validate128.evaluated = {
  props: {
    k: true,
    max: true,
    ph: true,
    val: true,
    dis: true,
    confirm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
const schema136 = {
  $id: 'https://schema.serialdash.dev/v1/widgets/color.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Widget: color (control)',
  type: 'object',
  allOf: [
    { $ref: 'common.schema.json#/$defs/widgetBase' },
    { $ref: 'common.schema.json#/$defs/controlExtras' },
  ],
  properties: {
    k: { const: 'color' },
    swatches: { type: 'array', items: { $ref: 'common.schema.json#/$defs/color' } },
  },
  required: ['k'],
};
function validate134(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate134.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.k === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('w' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'w' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err4 = {
            instancePath: instancePath + '/id',
            schemaPath: '#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
      } else {
        const err5 = {
          instancePath: instancePath + '/id',
          schemaPath: '#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.k !== undefined) {
      if (typeof data.k !== 'string') {
        const err6 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== undefined) {
      let data3 = data.title;
      if (typeof data3 === 'string') {
        if (func1(data3) > 48) {
          const err7 = {
            instancePath: instancePath + '/title',
            schemaPath: '#/properties/title/maxLength',
            keyword: 'maxLength',
            params: { limit: 48 },
            message: 'must NOT have more than 48 characters',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = {
          instancePath: instancePath + '/title',
          schemaPath: '#/properties/title/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.ch !== undefined) {
      if (
        !validate25(data.ch, {
          instancePath: instancePath + '/ch',
          parentData: data,
          parentDataProperty: 'ch',
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
        errors = vErrors.length;
      }
    }
    if (data.grp !== undefined) {
      let data5 = data.grp;
      if (typeof data5 === 'string') {
        if (func1(data5) > 24) {
          const err9 = {
            instancePath: instancePath + '/grp',
            schemaPath: '#/properties/grp/maxLength',
            keyword: 'maxLength',
            params: { limit: 24 },
            message: 'must NOT have more than 24 characters',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = {
          instancePath: instancePath + '/grp',
          schemaPath: '#/properties/grp/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.ord !== undefined) {
      let data6 = data.ord;
      if (!(typeof data6 == 'number' && !(data6 % 1) && !isNaN(data6) && isFinite(data6))) {
        const err11 = {
          instancePath: instancePath + '/ord',
          schemaPath: '#/properties/ord/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.size !== undefined) {
      let data7 = data.size;
      if (Array.isArray(data7)) {
        if (data7.length > 2) {
          const err12 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/maxItems',
            keyword: 'maxItems',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        if (data7.length < 2) {
          const err13 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/minItems',
            keyword: 'minItems',
            params: { limit: 2 },
            message: 'must NOT have fewer than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data7.length;
        if (len0 > 0) {
          let data8 = data7[0];
          if (!(typeof data8 == 'number' && !(data8 % 1) && !isNaN(data8) && isFinite(data8))) {
            const err14 = {
              instancePath: instancePath + '/size/0',
              schemaPath: '#/properties/size/prefixItems/0/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if (typeof data8 == 'number' && isFinite(data8)) {
            if (data8 > 12 || isNaN(data8)) {
              const err15 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/maximum',
                keyword: 'maximum',
                params: { comparison: '<=', limit: 12 },
                message: 'must be <= 12',
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data8 < 1 || isNaN(data8)) {
              const err16 = {
                instancePath: instancePath + '/size/0',
                schemaPath: '#/properties/size/prefixItems/0/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
          }
        }
        if (len0 > 1) {
          let data9 = data7[1];
          if (!(typeof data9 == 'number' && !(data9 % 1) && !isNaN(data9) && isFinite(data9))) {
            const err17 = {
              instancePath: instancePath + '/size/1',
              schemaPath: '#/properties/size/prefixItems/1/type',
              keyword: 'type',
              params: { type: 'integer' },
              message: 'must be integer',
            };
            if (vErrors === null) {
              vErrors = [err17];
            } else {
              vErrors.push(err17);
            }
            errors++;
          }
          if (typeof data9 == 'number' && isFinite(data9)) {
            if (data9 < 1 || isNaN(data9)) {
              const err18 = {
                instancePath: instancePath + '/size/1',
                schemaPath: '#/properties/size/prefixItems/1/minimum',
                keyword: 'minimum',
                params: { comparison: '>=', limit: 1 },
                message: 'must be >= 1',
              };
              if (vErrors === null) {
                vErrors = [err18];
              } else {
                vErrors.push(err18);
              }
              errors++;
            }
          }
        }
        const len1 = data7.length;
        if (!(len1 <= 2)) {
          const err19 = {
            instancePath: instancePath + '/size',
            schemaPath: '#/properties/size/items',
            keyword: 'items',
            params: { limit: 2 },
            message: 'must NOT have more than 2 items',
          };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/size',
          schemaPath: '#/properties/size/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.unit !== undefined) {
      let data10 = data.unit;
      if (typeof data10 === 'string') {
        if (func1(data10) > 8) {
          const err21 = {
            instancePath: instancePath + '/unit',
            schemaPath: '#/properties/unit/maxLength',
            keyword: 'maxLength',
            params: { limit: 8 },
            message: 'must NOT have more than 8 characters',
          };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = {
          instancePath: instancePath + '/unit',
          schemaPath: '#/properties/unit/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.dec !== undefined) {
      let data11 = data.dec;
      if (!(typeof data11 == 'number' && !(data11 % 1) && !isNaN(data11) && isFinite(data11))) {
        const err23 = {
          instancePath: instancePath + '/dec',
          schemaPath: '#/properties/dec/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data11 == 'number' && isFinite(data11)) {
        if (data11 > 6 || isNaN(data11)) {
          const err24 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 6 },
            message: 'must be <= 6',
          };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data11 < 0 || isNaN(data11)) {
          const err25 = {
            instancePath: instancePath + '/dec',
            schemaPath: '#/properties/dec/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
    }
    if (data.labels !== undefined) {
      let data12 = data.labels;
      if (Array.isArray(data12)) {
        const len2 = data12.length;
        for (let i0 = 0; i0 < len2; i0++) {
          if (typeof data12[i0] !== 'string') {
            const err26 = {
              instancePath: instancePath + '/labels/' + i0,
              schemaPath: '#/properties/labels/items/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          }
        }
      } else {
        const err27 = {
          instancePath: instancePath + '/labels',
          schemaPath: '#/properties/labels/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.colors !== undefined) {
      let data14 = data.colors;
      if (Array.isArray(data14)) {
        const len3 = data14.length;
        for (let i1 = 0; i1 < len3; i1++) {
          let data15 = data14[i1];
          if (typeof data15 === 'string') {
            if (!pattern7.test(data15)) {
              const err28 = {
                instancePath: instancePath + '/colors/' + i1,
                schemaPath: '#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err28];
              } else {
                vErrors.push(err28);
              }
              errors++;
            }
          } else {
            const err29 = {
              instancePath: instancePath + '/colors/' + i1,
              schemaPath: '#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err29];
            } else {
              vErrors.push(err29);
            }
            errors++;
          }
        }
      } else {
        const err30 = {
          instancePath: instancePath + '/colors',
          schemaPath: '#/properties/colors/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
    }
    if (data.stale !== undefined) {
      let data16 = data.stale;
      if (typeof data16 == 'number' && isFinite(data16)) {
        if (data16 <= 0 || isNaN(data16)) {
          const err31 = {
            instancePath: instancePath + '/stale',
            schemaPath: '#/properties/stale/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
      } else {
        const err32 = {
          instancePath: instancePath + '/stale',
          schemaPath: '#/properties/stale/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err32];
        } else {
          vErrors.push(err32);
        }
        errors++;
      }
    }
  } else {
    const err33 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err33];
    } else {
      vErrors.push(err33);
    }
    errors++;
  }
  validate134.errors = vErrors;
  return errors === 0;
}
validate134.evaluated = {
  props: {
    t: true,
    id: true,
    k: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate133(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/widgets/color.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate133.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (
    !validate134(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate134.errors : vErrors.concat(validate134.errors);
    errors = vErrors.length;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.dis !== undefined) {
      if (typeof data.dis !== 'boolean') {
        const err0 = {
          instancePath: instancePath + '/dis',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/dis/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err0];
        } else {
          vErrors.push(err0);
        }
        errors++;
      }
    }
    if (data.confirm !== undefined) {
      if (typeof data.confirm !== 'string') {
        const err1 = {
          instancePath: instancePath + '/confirm',
          schemaPath: 'common.schema.json#/$defs/controlExtras/properties/confirm/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    const err2 = {
      instancePath,
      schemaPath: 'common.schema.json#/$defs/controlExtras/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.k === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'k' },
        message: "must have required property '" + 'k' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.k !== undefined) {
      if ('color' !== data.k) {
        const err4 = {
          instancePath: instancePath + '/k',
          schemaPath: '#/properties/k/const',
          keyword: 'const',
          params: { allowedValue: 'color' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.swatches !== undefined) {
      let data3 = data.swatches;
      if (Array.isArray(data3)) {
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data4 = data3[i0];
          if (typeof data4 === 'string') {
            if (!pattern7.test(data4)) {
              const err5 = {
                instancePath: instancePath + '/swatches/' + i0,
                schemaPath: 'common.schema.json#/$defs/color/pattern',
                keyword: 'pattern',
                params: { pattern: '^#[0-9A-Fa-f]{6}$' },
                message: 'must match pattern "' + '^#[0-9A-Fa-f]{6}$' + '"',
              };
              if (vErrors === null) {
                vErrors = [err5];
              } else {
                vErrors.push(err5);
              }
              errors++;
            }
          } else {
            const err6 = {
              instancePath: instancePath + '/swatches/' + i0,
              schemaPath: 'common.schema.json#/$defs/color/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/swatches',
          schemaPath: '#/properties/swatches/type',
          keyword: 'type',
          params: { type: 'array' },
          message: 'must be array',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate133.errors = vErrors;
  return errors === 0;
}
validate133.evaluated = {
  props: {
    k: true,
    swatches: true,
    val: true,
    dis: true,
    confirm: true,
    t: true,
    id: true,
    title: true,
    ch: true,
    grp: true,
    ord: true,
    size: true,
    unit: true,
    dec: true,
    labels: true,
    colors: true,
    stale: true,
  },
  dynamicProps: false,
  dynamicItems: false,
};
function validate21(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (
    !validate22(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.k = true;
    props0.min = true;
    props0.max = true;
    props0.win = true;
    props0.step = true;
    props0.fill = true;
    props0.t = true;
    props0.id = true;
    props0.title = true;
    props0.ch = true;
    props0.grp = true;
    props0.ord = true;
    props0.size = true;
    props0.unit = true;
    props0.dec = true;
    props0.labels = true;
    props0.colors = true;
    props0.stale = true;
  }
  const _errs2 = errors;
  if (
    !validate29(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = props0 || {};
        props0.k = true;
        props0.trend = true;
        props0.minmax = true;
        props0.warn = true;
        props0.alarm = true;
        props0.t = true;
        props0.id = true;
        props0.title = true;
        props0.ch = true;
        props0.grp = true;
        props0.ord = true;
        props0.size = true;
        props0.unit = true;
        props0.dec = true;
        props0.labels = true;
        props0.colors = true;
        props0.stale = true;
      }
    }
    const _errs3 = errors;
    if (
      !validate34(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
    ) {
      vErrors = vErrors === null ? validate34.errors : vErrors.concat(validate34.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.k = true;
          props0.min = true;
          props0.max = true;
          props0.zones = true;
          props0.t = true;
          props0.id = true;
          props0.title = true;
          props0.ch = true;
          props0.grp = true;
          props0.ord = true;
          props0.size = true;
          props0.unit = true;
          props0.dec = true;
          props0.labels = true;
          props0.colors = true;
          props0.stale = true;
        }
      }
      const _errs4 = errors;
      if (
        !validate41(data, {
          instancePath,
          parentData,
          parentDataProperty,
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate41.errors : vErrors.concat(validate41.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs4 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
          if (props0 !== true) {
            props0 = props0 || {};
            props0.k = true;
            props0.on = true;
            props0.off = true;
            props0.states = true;
            props0.t = true;
            props0.id = true;
            props0.title = true;
            props0.ch = true;
            props0.grp = true;
            props0.ord = true;
            props0.size = true;
            props0.unit = true;
            props0.dec = true;
            props0.labels = true;
            props0.colors = true;
            props0.stale = true;
          }
        }
        const _errs5 = errors;
        if (
          !validate46(data, {
            instancePath,
            parentData,
            parentDataProperty,
            rootData,
            dynamicAnchors,
          })
        ) {
          vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
          errors = vErrors.length;
        }
        var _valid0 = _errs5 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 4];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 4;
            if (props0 !== true) {
              props0 = props0 || {};
              props0.k = true;
              props0.lvl = true;
              props0.src = true;
              props0.max = true;
              props0.t = true;
              props0.id = true;
              props0.title = true;
              props0.ch = true;
              props0.grp = true;
              props0.ord = true;
              props0.size = true;
              props0.unit = true;
              props0.dec = true;
              props0.labels = true;
              props0.colors = true;
              props0.stale = true;
            }
          }
          const _errs6 = errors;
          if (
            !validate51(data, {
              instancePath,
              parentData,
              parentDataProperty,
              rootData,
              dynamicAnchors,
            })
          ) {
            vErrors = vErrors === null ? validate51.errors : vErrors.concat(validate51.errors);
            errors = vErrors.length;
          }
          var _valid0 = _errs6 === errors;
          if (_valid0 && valid0) {
            valid0 = false;
            passing0 = [passing0, 5];
          } else {
            if (_valid0) {
              valid0 = true;
              passing0 = 5;
              if (props0 !== true) {
                props0 = props0 || {};
                props0.k = true;
                props0.xmin = true;
                props0.xmax = true;
                props0.ymin = true;
                props0.ymax = true;
                props0.trail = true;
                props0.mode = true;
                props0.xlabel = true;
                props0.ylabel = true;
                props0.t = true;
                props0.id = true;
                props0.title = true;
                props0.ch = true;
                props0.grp = true;
                props0.ord = true;
                props0.size = true;
                props0.unit = true;
                props0.dec = true;
                props0.labels = true;
                props0.colors = true;
                props0.stale = true;
              }
            }
            const _errs7 = errors;
            if (
              !validate56(data, {
                instancePath,
                parentData,
                parentDataProperty,
                rootData,
                dynamicAnchors,
              })
            ) {
              vErrors = vErrors === null ? validate56.errors : vErrors.concat(validate56.errors);
              errors = vErrors.length;
            }
            var _valid0 = _errs7 === errors;
            if (_valid0 && valid0) {
              valid0 = false;
              passing0 = [passing0, 6];
            } else {
              if (_valid0) {
                valid0 = true;
                passing0 = 6;
                if (props0 !== true) {
                  props0 = props0 || {};
                  props0.k = true;
                  props0.min = true;
                  props0.max = true;
                  props0.horiz = true;
                  props0.xlabels = true;
                  props0.t = true;
                  props0.id = true;
                  props0.title = true;
                  props0.ch = true;
                  props0.grp = true;
                  props0.ord = true;
                  props0.size = true;
                  props0.unit = true;
                  props0.dec = true;
                  props0.labels = true;
                  props0.colors = true;
                  props0.stale = true;
                }
              }
              const _errs8 = errors;
              if (
                !validate61(data, {
                  instancePath,
                  parentData,
                  parentDataProperty,
                  rootData,
                  dynamicAnchors,
                })
              ) {
                vErrors = vErrors === null ? validate61.errors : vErrors.concat(validate61.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs8 === errors;
              if (_valid0 && valid0) {
                valid0 = false;
                passing0 = [passing0, 7];
              } else {
                if (_valid0) {
                  valid0 = true;
                  passing0 = 7;
                  if (props0 !== true) {
                    props0 = props0 || {};
                    props0.k = true;
                    props0.donut = true;
                    props0.pct = true;
                    props0.t = true;
                    props0.id = true;
                    props0.title = true;
                    props0.ch = true;
                    props0.grp = true;
                    props0.ord = true;
                    props0.size = true;
                    props0.unit = true;
                    props0.dec = true;
                    props0.labels = true;
                    props0.colors = true;
                    props0.stale = true;
                  }
                }
                const _errs9 = errors;
                if (
                  !validate66(data, {
                    instancePath,
                    parentData,
                    parentDataProperty,
                    rootData,
                    dynamicAnchors,
                  })
                ) {
                  vErrors =
                    vErrors === null ? validate66.errors : vErrors.concat(validate66.errors);
                  errors = vErrors.length;
                }
                var _valid0 = _errs9 === errors;
                if (_valid0 && valid0) {
                  valid0 = false;
                  passing0 = [passing0, 8];
                } else {
                  if (_valid0) {
                    valid0 = true;
                    passing0 = 8;
                    if (props0 !== true) {
                      props0 = props0 || {};
                      props0.k = true;
                      props0.min = true;
                      props0.max = true;
                      props0.vert = true;
                      props0.zones = true;
                      props0.t = true;
                      props0.id = true;
                      props0.title = true;
                      props0.ch = true;
                      props0.grp = true;
                      props0.ord = true;
                      props0.size = true;
                      props0.unit = true;
                      props0.dec = true;
                      props0.labels = true;
                      props0.colors = true;
                      props0.stale = true;
                    }
                  }
                  const _errs10 = errors;
                  if (
                    !validate73(data, {
                      instancePath,
                      parentData,
                      parentDataProperty,
                      rootData,
                      dynamicAnchors,
                    })
                  ) {
                    vErrors =
                      vErrors === null ? validate73.errors : vErrors.concat(validate73.errors);
                    errors = vErrors.length;
                  }
                  var _valid0 = _errs10 === errors;
                  if (_valid0 && valid0) {
                    valid0 = false;
                    passing0 = [passing0, 9];
                  } else {
                    if (_valid0) {
                      valid0 = true;
                      passing0 = 9;
                      if (props0 !== true) {
                        props0 = props0 || {};
                        props0.k = true;
                        props0.cols = true;
                        props0.t = true;
                        props0.id = true;
                        props0.title = true;
                        props0.ch = true;
                        props0.grp = true;
                        props0.ord = true;
                        props0.size = true;
                        props0.unit = true;
                        props0.dec = true;
                        props0.labels = true;
                        props0.colors = true;
                        props0.stale = true;
                      }
                    }
                    const _errs11 = errors;
                    if (
                      !validate78(data, {
                        instancePath,
                        parentData,
                        parentDataProperty,
                        rootData,
                        dynamicAnchors,
                      })
                    ) {
                      vErrors =
                        vErrors === null ? validate78.errors : vErrors.concat(validate78.errors);
                      errors = vErrors.length;
                    }
                    var _valid0 = _errs11 === errors;
                    if (_valid0 && valid0) {
                      valid0 = false;
                      passing0 = [passing0, 10];
                    } else {
                      if (_valid0) {
                        valid0 = true;
                        passing0 = 10;
                        if (props0 !== true) {
                          props0 = props0 || {};
                          props0.k = true;
                          props0.rows = true;
                          props0.cols = true;
                          props0.min = true;
                          props0.max = true;
                          props0.palette = true;
                          props0.interp = true;
                          props0.t = true;
                          props0.id = true;
                          props0.title = true;
                          props0.ch = true;
                          props0.grp = true;
                          props0.ord = true;
                          props0.size = true;
                          props0.unit = true;
                          props0.dec = true;
                          props0.labels = true;
                          props0.colors = true;
                          props0.stale = true;
                        }
                      }
                      const _errs12 = errors;
                      if (
                        !validate83(data, {
                          instancePath,
                          parentData,
                          parentDataProperty,
                          rootData,
                          dynamicAnchors,
                        })
                      ) {
                        vErrors =
                          vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
                        errors = vErrors.length;
                      }
                      var _valid0 = _errs12 === errors;
                      if (_valid0 && valid0) {
                        valid0 = false;
                        passing0 = [passing0, 11];
                      } else {
                        if (_valid0) {
                          valid0 = true;
                          passing0 = 11;
                          if (props0 !== true) {
                            props0 = props0 || {};
                            props0.k = true;
                            props0.bins = true;
                            props0.min = true;
                            props0.max = true;
                            props0.n = true;
                            props0.t = true;
                            props0.id = true;
                            props0.title = true;
                            props0.ch = true;
                            props0.grp = true;
                            props0.ord = true;
                            props0.size = true;
                            props0.unit = true;
                            props0.dec = true;
                            props0.labels = true;
                            props0.colors = true;
                            props0.stale = true;
                          }
                        }
                        const _errs13 = errors;
                        if (
                          !validate88(data, {
                            instancePath,
                            parentData,
                            parentDataProperty,
                            rootData,
                            dynamicAnchors,
                          })
                        ) {
                          vErrors =
                            vErrors === null
                              ? validate88.errors
                              : vErrors.concat(validate88.errors);
                          errors = vErrors.length;
                        }
                        var _valid0 = _errs13 === errors;
                        if (_valid0 && valid0) {
                          valid0 = false;
                          passing0 = [passing0, 12];
                        } else {
                          if (_valid0) {
                            valid0 = true;
                            passing0 = 12;
                            if (props0 !== true) {
                              props0 = props0 || {};
                              props0.k = true;
                              props0.rmax = true;
                              props0.amin = true;
                              props0.amax = true;
                              props0.sweep = true;
                              props0.t = true;
                              props0.id = true;
                              props0.title = true;
                              props0.ch = true;
                              props0.grp = true;
                              props0.ord = true;
                              props0.size = true;
                              props0.unit = true;
                              props0.dec = true;
                              props0.labels = true;
                              props0.colors = true;
                              props0.stale = true;
                            }
                          }
                          const _errs14 = errors;
                          if (
                            !validate93(data, {
                              instancePath,
                              parentData,
                              parentDataProperty,
                              rootData,
                              dynamicAnchors,
                            })
                          ) {
                            vErrors =
                              vErrors === null
                                ? validate93.errors
                                : vErrors.concat(validate93.errors);
                            errors = vErrors.length;
                          }
                          var _valid0 = _errs14 === errors;
                          if (_valid0 && valid0) {
                            valid0 = false;
                            passing0 = [passing0, 13];
                          } else {
                            if (_valid0) {
                              valid0 = true;
                              passing0 = 13;
                              if (props0 !== true) {
                                props0 = props0 || {};
                                props0.k = true;
                                props0.ref = true;
                                props0.t = true;
                                props0.id = true;
                                props0.title = true;
                                props0.ch = true;
                                props0.grp = true;
                                props0.ord = true;
                                props0.size = true;
                                props0.unit = true;
                                props0.dec = true;
                                props0.labels = true;
                                props0.colors = true;
                                props0.stale = true;
                              }
                            }
                            const _errs15 = errors;
                            if (
                              !validate98(data, {
                                instancePath,
                                parentData,
                                parentDataProperty,
                                rootData,
                                dynamicAnchors,
                              })
                            ) {
                              vErrors =
                                vErrors === null
                                  ? validate98.errors
                                  : vErrors.concat(validate98.errors);
                              errors = vErrors.length;
                            }
                            var _valid0 = _errs15 === errors;
                            if (_valid0 && valid0) {
                              valid0 = false;
                              passing0 = [passing0, 14];
                            } else {
                              if (_valid0) {
                                valid0 = true;
                                passing0 = 14;
                                if (props0 !== true) {
                                  props0 = props0 || {};
                                  props0.k = true;
                                  props0.t = true;
                                  props0.id = true;
                                  props0.title = true;
                                  props0.ch = true;
                                  props0.grp = true;
                                  props0.ord = true;
                                  props0.size = true;
                                  props0.unit = true;
                                  props0.dec = true;
                                  props0.labels = true;
                                  props0.colors = true;
                                  props0.stale = true;
                                }
                              }
                              const _errs16 = errors;
                              if (
                                !validate103(data, {
                                  instancePath,
                                  parentData,
                                  parentDataProperty,
                                  rootData,
                                  dynamicAnchors,
                                })
                              ) {
                                vErrors =
                                  vErrors === null
                                    ? validate103.errors
                                    : vErrors.concat(validate103.errors);
                                errors = vErrors.length;
                              }
                              var _valid0 = _errs16 === errors;
                              if (_valid0 && valid0) {
                                valid0 = false;
                                passing0 = [passing0, 15];
                              } else {
                                if (_valid0) {
                                  valid0 = true;
                                  passing0 = 15;
                                  if (props0 !== true) {
                                    props0 = props0 || {};
                                    props0.k = true;
                                    props0.hold = true;
                                    props0.label = true;
                                    props0.color = true;
                                    props0.val = true;
                                    props0.dis = true;
                                    props0.confirm = true;
                                    props0.t = true;
                                    props0.id = true;
                                    props0.title = true;
                                    props0.ch = true;
                                    props0.grp = true;
                                    props0.ord = true;
                                    props0.size = true;
                                    props0.unit = true;
                                    props0.dec = true;
                                    props0.labels = true;
                                    props0.colors = true;
                                    props0.stale = true;
                                  }
                                }
                                const _errs17 = errors;
                                if (
                                  !validate108(data, {
                                    instancePath,
                                    parentData,
                                    parentDataProperty,
                                    rootData,
                                    dynamicAnchors,
                                  })
                                ) {
                                  vErrors =
                                    vErrors === null
                                      ? validate108.errors
                                      : vErrors.concat(validate108.errors);
                                  errors = vErrors.length;
                                }
                                var _valid0 = _errs17 === errors;
                                if (_valid0 && valid0) {
                                  valid0 = false;
                                  passing0 = [passing0, 16];
                                } else {
                                  if (_valid0) {
                                    valid0 = true;
                                    passing0 = 16;
                                    if (props0 !== true) {
                                      props0 = props0 || {};
                                      props0.k = true;
                                      props0.on = true;
                                      props0.off = true;
                                      props0.val = true;
                                      props0.dis = true;
                                      props0.confirm = true;
                                      props0.t = true;
                                      props0.id = true;
                                      props0.title = true;
                                      props0.ch = true;
                                      props0.grp = true;
                                      props0.ord = true;
                                      props0.size = true;
                                      props0.unit = true;
                                      props0.dec = true;
                                      props0.labels = true;
                                      props0.colors = true;
                                      props0.stale = true;
                                    }
                                  }
                                  const _errs18 = errors;
                                  if (
                                    !validate113(data, {
                                      instancePath,
                                      parentData,
                                      parentDataProperty,
                                      rootData,
                                      dynamicAnchors,
                                    })
                                  ) {
                                    vErrors =
                                      vErrors === null
                                        ? validate113.errors
                                        : vErrors.concat(validate113.errors);
                                    errors = vErrors.length;
                                  }
                                  var _valid0 = _errs18 === errors;
                                  if (_valid0 && valid0) {
                                    valid0 = false;
                                    passing0 = [passing0, 17];
                                  } else {
                                    if (_valid0) {
                                      valid0 = true;
                                      passing0 = 17;
                                      if (props0 !== true) {
                                        props0 = props0 || {};
                                        props0.k = true;
                                        props0.min = true;
                                        props0.max = true;
                                        props0.step = true;
                                        props0.vert = true;
                                        props0.val = true;
                                        props0.dis = true;
                                        props0.confirm = true;
                                        props0.t = true;
                                        props0.id = true;
                                        props0.title = true;
                                        props0.ch = true;
                                        props0.grp = true;
                                        props0.ord = true;
                                        props0.size = true;
                                        props0.unit = true;
                                        props0.dec = true;
                                        props0.labels = true;
                                        props0.colors = true;
                                        props0.stale = true;
                                      }
                                    }
                                    const _errs19 = errors;
                                    if (
                                      !validate118(data, {
                                        instancePath,
                                        parentData,
                                        parentDataProperty,
                                        rootData,
                                        dynamicAnchors,
                                      })
                                    ) {
                                      vErrors =
                                        vErrors === null
                                          ? validate118.errors
                                          : vErrors.concat(validate118.errors);
                                      errors = vErrors.length;
                                    }
                                    var _valid0 = _errs19 === errors;
                                    if (_valid0 && valid0) {
                                      valid0 = false;
                                      passing0 = [passing0, 18];
                                    } else {
                                      if (_valid0) {
                                        valid0 = true;
                                        passing0 = 18;
                                        if (props0 !== true) {
                                          props0 = props0 || {};
                                          props0.k = true;
                                          props0.min = true;
                                          props0.max = true;
                                          props0.step = true;
                                          props0.val = true;
                                          props0.dis = true;
                                          props0.confirm = true;
                                          props0.t = true;
                                          props0.id = true;
                                          props0.title = true;
                                          props0.ch = true;
                                          props0.grp = true;
                                          props0.ord = true;
                                          props0.size = true;
                                          props0.unit = true;
                                          props0.dec = true;
                                          props0.labels = true;
                                          props0.colors = true;
                                          props0.stale = true;
                                        }
                                      }
                                      const _errs20 = errors;
                                      if (
                                        !validate123(data, {
                                          instancePath,
                                          parentData,
                                          parentDataProperty,
                                          rootData,
                                          dynamicAnchors,
                                        })
                                      ) {
                                        vErrors =
                                          vErrors === null
                                            ? validate123.errors
                                            : vErrors.concat(validate123.errors);
                                        errors = vErrors.length;
                                      }
                                      var _valid0 = _errs20 === errors;
                                      if (_valid0 && valid0) {
                                        valid0 = false;
                                        passing0 = [passing0, 19];
                                      } else {
                                        if (_valid0) {
                                          valid0 = true;
                                          passing0 = 19;
                                          if (props0 !== true) {
                                            props0 = props0 || {};
                                            props0.k = true;
                                            props0.opts = true;
                                            props0.val = true;
                                            props0.dis = true;
                                            props0.confirm = true;
                                            props0.t = true;
                                            props0.id = true;
                                            props0.title = true;
                                            props0.ch = true;
                                            props0.grp = true;
                                            props0.ord = true;
                                            props0.size = true;
                                            props0.unit = true;
                                            props0.dec = true;
                                            props0.labels = true;
                                            props0.colors = true;
                                            props0.stale = true;
                                          }
                                        }
                                        const _errs21 = errors;
                                        if (
                                          !validate128(data, {
                                            instancePath,
                                            parentData,
                                            parentDataProperty,
                                            rootData,
                                            dynamicAnchors,
                                          })
                                        ) {
                                          vErrors =
                                            vErrors === null
                                              ? validate128.errors
                                              : vErrors.concat(validate128.errors);
                                          errors = vErrors.length;
                                        }
                                        var _valid0 = _errs21 === errors;
                                        if (_valid0 && valid0) {
                                          valid0 = false;
                                          passing0 = [passing0, 20];
                                        } else {
                                          if (_valid0) {
                                            valid0 = true;
                                            passing0 = 20;
                                            if (props0 !== true) {
                                              props0 = props0 || {};
                                              props0.k = true;
                                              props0.max = true;
                                              props0.ph = true;
                                              props0.val = true;
                                              props0.dis = true;
                                              props0.confirm = true;
                                              props0.t = true;
                                              props0.id = true;
                                              props0.title = true;
                                              props0.ch = true;
                                              props0.grp = true;
                                              props0.ord = true;
                                              props0.size = true;
                                              props0.unit = true;
                                              props0.dec = true;
                                              props0.labels = true;
                                              props0.colors = true;
                                              props0.stale = true;
                                            }
                                          }
                                          const _errs22 = errors;
                                          if (
                                            !validate133(data, {
                                              instancePath,
                                              parentData,
                                              parentDataProperty,
                                              rootData,
                                              dynamicAnchors,
                                            })
                                          ) {
                                            vErrors =
                                              vErrors === null
                                                ? validate133.errors
                                                : vErrors.concat(validate133.errors);
                                            errors = vErrors.length;
                                          }
                                          var _valid0 = _errs22 === errors;
                                          if (_valid0 && valid0) {
                                            valid0 = false;
                                            passing0 = [passing0, 21];
                                          } else {
                                            if (_valid0) {
                                              valid0 = true;
                                              passing0 = 21;
                                              if (props0 !== true) {
                                                props0 = props0 || {};
                                                props0.k = true;
                                                props0.swatches = true;
                                                props0.val = true;
                                                props0.dis = true;
                                                props0.confirm = true;
                                                props0.t = true;
                                                props0.id = true;
                                                props0.title = true;
                                                props0.ch = true;
                                                props0.grp = true;
                                                props0.ord = true;
                                                props0.size = true;
                                                props0.unit = true;
                                                props0.dec = true;
                                                props0.labels = true;
                                                props0.colors = true;
                                                props0.stale = true;
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/oneOf',
      keyword: 'oneOf',
      params: { passingSchemas: passing0 },
      message: 'must match exactly one schema in oneOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate21.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate21.evaluated = { dynamicProps: true, dynamicItems: false };
const schema142 = {
  description:
    'Partial update: shallow-merges the given fields into the existing widget. `id` and `k` are not modifiable.',
  type: 'object',
  properties: { t: { const: 'u' }, id: { $ref: 'widgets/common.schema.json#/$defs/identifier' } },
  not: { properties: { k: {} }, required: ['k'] },
  required: ['t', 'id'],
};
function validate139(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate139.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs1 = errors;
  const _errs2 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    let missing0;
    if (data.k === undefined && (missing0 = 'k')) {
      const err0 = {};
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var valid0 = _errs2 === errors;
  if (valid0) {
    const err1 = {
      instancePath,
      schemaPath: '#/not',
      keyword: 'not',
      params: {},
      message: 'must NOT be valid',
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('u' !== data.t) {
        const err4 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'u' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err5 = {
            instancePath: instancePath + '/id',
            schemaPath: 'widgets/common.schema.json#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      } else {
        const err6 = {
          instancePath: instancePath + '/id',
          schemaPath: 'widgets/common.schema.json#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate139.errors = vErrors;
  return errors === 0;
}
validate139.evaluated = { props: { t: true, id: true }, dynamicProps: false, dynamicItems: false };
const schema144 = {
  type: 'object',
  properties: { t: { const: 'x' }, id: { $ref: 'widgets/common.schema.json#/$defs/identifier' } },
  required: ['t'],
};
function validate141(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate141.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('x' !== data.t) {
        const err1 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'x' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.id !== undefined) {
      let data1 = data.id;
      if (typeof data1 === 'string') {
        if (!pattern4.test(data1)) {
          const err2 = {
            instancePath: instancePath + '/id',
            schemaPath: 'widgets/common.schema.json#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
      } else {
        const err3 = {
          instancePath: instancePath + '/id',
          schemaPath: 'widgets/common.schema.json#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
  } else {
    const err4 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err4];
    } else {
      vErrors.push(err4);
    }
    errors++;
  }
  validate141.errors = vErrors;
  return errors === 0;
}
validate141.evaluated = { props: { t: true, id: true }, dynamicProps: false, dynamicItems: false };
const schema146 = {
  type: 'object',
  properties: {
    t: { const: 'd' },
    d: { type: 'object', additionalProperties: { $ref: '#/$defs/channelValue' } },
    ts: { type: 'integer', minimum: 0 },
  },
  required: ['t', 'd'],
};
const schema147 = {
  description:
    "Forms a channel value may take (§3.3 `d`). anyOf, not oneOf: e.g. a 2-number array is a valid 'xy pair' and a valid 'array of numbers' at once — which one it means depends on the consuming widget, not on the JSON shape.",
  anyOf: [
    { type: 'number' },
    { type: 'boolean' },
    { type: 'string' },
    { type: 'null' },
    {
      type: 'array',
      prefixItems: [{ type: 'number' }, { type: 'number' }],
      items: false,
      minItems: 2,
      maxItems: 2,
      description: '[x, y] pair (xy, polar).',
    },
    {
      type: 'array',
      items: { type: 'number' },
      description: 'Array of numbers (heat, bar spectrum).',
    },
    {
      type: 'object',
      additionalProperties: { oneOf: [{ type: 'number' }, { type: 'string' }] },
      description: 'label → number|string map (pie, bar, table).',
    },
  ],
};
function validate143(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate143.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.d === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'd' },
        message: "must have required property '" + 'd' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('d' !== data.t) {
        const err2 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'd' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.d !== undefined) {
      let data1 = data.d;
      if (data1 && typeof data1 == 'object' && !Array.isArray(data1)) {
        for (const key0 in data1) {
          let data2 = data1[key0];
          const _errs7 = errors;
          let valid3 = false;
          const _errs8 = errors;
          if (!(typeof data2 == 'number' && isFinite(data2))) {
            const err3 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf/0/type',
              keyword: 'type',
              params: { type: 'number' },
              message: 'must be number',
            };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
          }
          var _valid0 = _errs8 === errors;
          valid3 = valid3 || _valid0;
          const _errs10 = errors;
          if (typeof data2 !== 'boolean') {
            const err4 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf/1/type',
              keyword: 'type',
              params: { type: 'boolean' },
              message: 'must be boolean',
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
          var _valid0 = _errs10 === errors;
          valid3 = valid3 || _valid0;
          const _errs12 = errors;
          if (typeof data2 !== 'string') {
            const err5 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf/2/type',
              keyword: 'type',
              params: { type: 'string' },
              message: 'must be string',
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
          var _valid0 = _errs12 === errors;
          valid3 = valid3 || _valid0;
          const _errs14 = errors;
          if (data2 !== null) {
            const err6 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf/3/type',
              keyword: 'type',
              params: { type: 'null' },
              message: 'must be null',
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
          var _valid0 = _errs14 === errors;
          valid3 = valid3 || _valid0;
          const _errs16 = errors;
          if (Array.isArray(data2)) {
            if (data2.length > 2) {
              const err7 = {
                instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                schemaPath: '#/$defs/channelValue/anyOf/4/maxItems',
                keyword: 'maxItems',
                params: { limit: 2 },
                message: 'must NOT have more than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data2.length < 2) {
              const err8 = {
                instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                schemaPath: '#/$defs/channelValue/anyOf/4/minItems',
                keyword: 'minItems',
                params: { limit: 2 },
                message: 'must NOT have fewer than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            const len0 = data2.length;
            if (len0 > 0) {
              let data3 = data2[0];
              if (!(typeof data3 == 'number' && isFinite(data3))) {
                const err9 = {
                  instancePath:
                    instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1') + '/0',
                  schemaPath: '#/$defs/channelValue/anyOf/4/prefixItems/0/type',
                  keyword: 'type',
                  params: { type: 'number' },
                  message: 'must be number',
                };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (len0 > 1) {
              let data4 = data2[1];
              if (!(typeof data4 == 'number' && isFinite(data4))) {
                const err10 = {
                  instancePath:
                    instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1') + '/1',
                  schemaPath: '#/$defs/channelValue/anyOf/4/prefixItems/1/type',
                  keyword: 'type',
                  params: { type: 'number' },
                  message: 'must be number',
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
            const len1 = data2.length;
            if (!(len1 <= 2)) {
              const err11 = {
                instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
                schemaPath: '#/$defs/channelValue/anyOf/4/items',
                keyword: 'items',
                params: { limit: 2 },
                message: 'must NOT have more than 2 items',
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          } else {
            const err12 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf/4/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
          var _valid0 = _errs16 === errors;
          valid3 = valid3 || _valid0;
          if (_valid0) {
            var items0 = true;
          }
          const _errs22 = errors;
          if (Array.isArray(data2)) {
            const len2 = data2.length;
            for (let i0 = 0; i0 < len2; i0++) {
              let data5 = data2[i0];
              if (!(typeof data5 == 'number' && isFinite(data5))) {
                const err13 = {
                  instancePath:
                    instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1') + '/' + i0,
                  schemaPath: '#/$defs/channelValue/anyOf/5/items/type',
                  keyword: 'type',
                  params: { type: 'number' },
                  message: 'must be number',
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
          } else {
            const err14 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf/5/type',
              keyword: 'type',
              params: { type: 'array' },
              message: 'must be array',
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          var _valid0 = _errs22 === errors;
          valid3 = valid3 || _valid0;
          if (_valid0) {
            if (items0 !== true) {
              items0 = true;
            }
          }
          const _errs26 = errors;
          if (data2 && typeof data2 == 'object' && !Array.isArray(data2)) {
            for (const key1 in data2) {
              let data6 = data2[key1];
              const _errs30 = errors;
              let valid8 = false;
              let passing0 = null;
              const _errs31 = errors;
              if (!(typeof data6 == 'number' && isFinite(data6))) {
                const err15 = {
                  instancePath:
                    instancePath +
                    '/d/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1') +
                    '/' +
                    key1.replace(/~/g, '~0').replace(/\//g, '~1'),
                  schemaPath: '#/$defs/channelValue/anyOf/6/additionalProperties/oneOf/0/type',
                  keyword: 'type',
                  params: { type: 'number' },
                  message: 'must be number',
                };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
              var _valid1 = _errs31 === errors;
              if (_valid1) {
                valid8 = true;
                passing0 = 0;
              }
              const _errs33 = errors;
              if (typeof data6 !== 'string') {
                const err16 = {
                  instancePath:
                    instancePath +
                    '/d/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1') +
                    '/' +
                    key1.replace(/~/g, '~0').replace(/\//g, '~1'),
                  schemaPath: '#/$defs/channelValue/anyOf/6/additionalProperties/oneOf/1/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err16];
                } else {
                  vErrors.push(err16);
                }
                errors++;
              }
              var _valid1 = _errs33 === errors;
              if (_valid1 && valid8) {
                valid8 = false;
                passing0 = [passing0, 1];
              } else {
                if (_valid1) {
                  valid8 = true;
                  passing0 = 1;
                }
              }
              if (!valid8) {
                const err17 = {
                  instancePath:
                    instancePath +
                    '/d/' +
                    key0.replace(/~/g, '~0').replace(/\//g, '~1') +
                    '/' +
                    key1.replace(/~/g, '~0').replace(/\//g, '~1'),
                  schemaPath: '#/$defs/channelValue/anyOf/6/additionalProperties/oneOf',
                  keyword: 'oneOf',
                  params: { passingSchemas: passing0 },
                  message: 'must match exactly one schema in oneOf',
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              } else {
                errors = _errs30;
                if (vErrors !== null) {
                  if (_errs30) {
                    vErrors.length = _errs30;
                  } else {
                    vErrors = null;
                  }
                }
              }
            }
          } else {
            const err18 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf/6/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
          var _valid0 = _errs26 === errors;
          valid3 = valid3 || _valid0;
          if (!valid3) {
            const err19 = {
              instancePath: instancePath + '/d/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
              schemaPath: '#/$defs/channelValue/anyOf',
              keyword: 'anyOf',
              params: {},
              message: 'must match a schema in anyOf',
            };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          } else {
            errors = _errs7;
            if (vErrors !== null) {
              if (_errs7) {
                vErrors.length = _errs7;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        const err20 = {
          instancePath: instancePath + '/d',
          schemaPath: '#/properties/d/type',
          keyword: 'type',
          params: { type: 'object' },
          message: 'must be object',
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.ts !== undefined) {
      let data7 = data.ts;
      if (!(typeof data7 == 'number' && !(data7 % 1) && !isNaN(data7) && isFinite(data7))) {
        const err21 = {
          instancePath: instancePath + '/ts',
          schemaPath: '#/properties/ts/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
      if (typeof data7 == 'number' && isFinite(data7)) {
        if (data7 < 0 || isNaN(data7)) {
          const err22 = {
            instancePath: instancePath + '/ts',
            schemaPath: '#/properties/ts/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 0 },
            message: 'must be >= 0',
          };
          if (vErrors === null) {
            vErrors = [err22];
          } else {
            vErrors.push(err22);
          }
          errors++;
        }
      }
    }
  } else {
    const err23 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err23];
    } else {
      vErrors.push(err23);
    }
    errors++;
  }
  validate143.errors = vErrors;
  return errors === 0;
}
validate143.evaluated = {
  props: { t: true, d: true, ts: true },
  dynamicProps: false,
  dynamicItems: false,
};
function validate20(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/device-to-app.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/$defs/hi/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.v === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/$defs/hi/required',
        keyword: 'required',
        params: { missingProperty: 'v' },
        message: "must have required property '" + 'v' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.name === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/$defs/hi/required',
        keyword: 'required',
        params: { missingProperty: 'name' },
        message: "must have required property '" + 'name' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.t !== undefined) {
      if ('hi' !== data.t) {
        const err3 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/$defs/hi/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'hi' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.v !== undefined) {
      let data1 = data.v;
      if (!(typeof data1 == 'number' && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
        const err4 = {
          instancePath: instancePath + '/v',
          schemaPath: '#/$defs/hi/properties/v/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (typeof data1 == 'number' && isFinite(data1)) {
        if (data1 < 1 || isNaN(data1)) {
          const err5 = {
            instancePath: instancePath + '/v',
            schemaPath: '#/$defs/hi/properties/v/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
      }
    }
    if (data.name !== undefined) {
      let data2 = data.name;
      if (typeof data2 === 'string') {
        if (func1(data2) > 32) {
          const err6 = {
            instancePath: instancePath + '/name',
            schemaPath: '#/$defs/hi/properties/name/maxLength',
            keyword: 'maxLength',
            params: { limit: 32 },
            message: 'must NOT have more than 32 characters',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = {
          instancePath: instancePath + '/name',
          schemaPath: '#/$defs/hi/properties/name/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.fw !== undefined) {
      let data3 = data.fw;
      if (typeof data3 === 'string') {
        if (func1(data3) > 16) {
          const err8 = {
            instancePath: instancePath + '/fw',
            schemaPath: '#/$defs/hi/properties/fw/maxLength',
            keyword: 'maxLength',
            params: { limit: 16 },
            message: 'must NOT have more than 16 characters',
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = {
          instancePath: instancePath + '/fw',
          schemaPath: '#/$defs/hi/properties/fw/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.board !== undefined) {
      let data4 = data.board;
      if (typeof data4 === 'string') {
        if (func1(data4) > 16) {
          const err10 = {
            instancePath: instancePath + '/board',
            schemaPath: '#/$defs/hi/properties/board/maxLength',
            keyword: 'maxLength',
            params: { limit: 16 },
            message: 'must NOT have more than 16 characters',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/board',
          schemaPath: '#/$defs/hi/properties/board/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.rx !== undefined) {
      let data5 = data.rx;
      if (!(typeof data5 == 'number' && !(data5 % 1) && !isNaN(data5) && isFinite(data5))) {
        const err12 = {
          instancePath: instancePath + '/rx',
          schemaPath: '#/$defs/hi/properties/rx/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      if (typeof data5 == 'number' && isFinite(data5)) {
        if (data5 <= 0 || isNaN(data5)) {
          const err13 = {
            instancePath: instancePath + '/rx',
            schemaPath: '#/$defs/hi/properties/rx/exclusiveMinimum',
            keyword: 'exclusiveMinimum',
            params: { comparison: '>', limit: 0 },
            message: 'must be > 0',
          };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: '#/$defs/hi/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err14];
    } else {
      vErrors.push(err14);
    }
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = {};
    props0.t = true;
    props0.v = true;
    props0.name = true;
    props0.fw = true;
    props0.board = true;
    props0.rx = true;
  }
  const _errs15 = errors;
  if (
    !validate21(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
    errors = vErrors.length;
  } else {
    var props1 = validate21.evaluated.props;
  }
  var _valid0 = _errs15 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true && props1 !== undefined) {
        if (props1 === true) {
          props0 = true;
        } else {
          props0 = props0 || {};
          Object.assign(props0, props1);
        }
      }
    }
    const _errs16 = errors;
    if (
      !validate139(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
    ) {
      vErrors = vErrors === null ? validate139.errors : vErrors.concat(validate139.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs16 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = props0 || {};
          props0.t = true;
          props0.id = true;
        }
      }
      const _errs17 = errors;
      if (
        !validate141(data, {
          instancePath,
          parentData,
          parentDataProperty,
          rootData,
          dynamicAnchors,
        })
      ) {
        vErrors = vErrors === null ? validate141.errors : vErrors.concat(validate141.errors);
        errors = vErrors.length;
      }
      var _valid0 = _errs17 === errors;
      if (_valid0 && valid0) {
        valid0 = false;
        passing0 = [passing0, 3];
      } else {
        if (_valid0) {
          valid0 = true;
          passing0 = 3;
          if (props0 !== true) {
            props0 = props0 || {};
            props0.t = true;
            props0.id = true;
          }
        }
        const _errs18 = errors;
        if (
          !validate143(data, {
            instancePath,
            parentData,
            parentDataProperty,
            rootData,
            dynamicAnchors,
          })
        ) {
          vErrors = vErrors === null ? validate143.errors : vErrors.concat(validate143.errors);
          errors = vErrors.length;
        }
        var _valid0 = _errs18 === errors;
        if (_valid0 && valid0) {
          valid0 = false;
          passing0 = [passing0, 4];
        } else {
          if (_valid0) {
            valid0 = true;
            passing0 = 4;
            if (props0 !== true) {
              props0 = props0 || {};
              props0.t = true;
              props0.d = true;
              props0.ts = true;
            }
          }
          const _errs19 = errors;
          if (data && typeof data == 'object' && !Array.isArray(data)) {
            if (data.t === undefined) {
              const err15 = {
                instancePath,
                schemaPath: '#/$defs/e/required',
                keyword: 'required',
                params: { missingProperty: 't' },
                message: "must have required property '" + 't' + "'",
              };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data.msg === undefined) {
              const err16 = {
                instancePath,
                schemaPath: '#/$defs/e/required',
                keyword: 'required',
                params: { missingProperty: 'msg' },
                message: "must have required property '" + 'msg' + "'",
              };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (data.t !== undefined) {
              if ('e' !== data.t) {
                const err17 = {
                  instancePath: instancePath + '/t',
                  schemaPath: '#/$defs/e/properties/t/const',
                  keyword: 'const',
                  params: { allowedValue: 'e' },
                  message: 'must be equal to constant',
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
            }
            if (data.lvl !== undefined) {
              let data7 = data.lvl;
              if (!(data7 === 'debug' || data7 === 'info' || data7 === 'warn' || data7 === 'err')) {
                const err18 = {
                  instancePath: instancePath + '/lvl',
                  schemaPath: '#/$defs/e/properties/lvl/enum',
                  keyword: 'enum',
                  params: { allowedValues: schema148.properties.lvl.enum },
                  message: 'must be equal to one of the allowed values',
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data.msg !== undefined) {
              if (typeof data.msg !== 'string') {
                const err19 = {
                  instancePath: instancePath + '/msg',
                  schemaPath: '#/$defs/e/properties/msg/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data.src !== undefined) {
              let data9 = data.src;
              if (typeof data9 === 'string') {
                if (func1(data9) > 16) {
                  const err20 = {
                    instancePath: instancePath + '/src',
                    schemaPath: '#/$defs/e/properties/src/maxLength',
                    keyword: 'maxLength',
                    params: { limit: 16 },
                    message: 'must NOT have more than 16 characters',
                  };
                  if (vErrors === null) {
                    vErrors = [err20];
                  } else {
                    vErrors.push(err20);
                  }
                  errors++;
                }
              } else {
                const err21 = {
                  instancePath: instancePath + '/src',
                  schemaPath: '#/$defs/e/properties/src/type',
                  keyword: 'type',
                  params: { type: 'string' },
                  message: 'must be string',
                };
                if (vErrors === null) {
                  vErrors = [err21];
                } else {
                  vErrors.push(err21);
                }
                errors++;
              }
            }
          } else {
            const err22 = {
              instancePath,
              schemaPath: '#/$defs/e/type',
              keyword: 'type',
              params: { type: 'object' },
              message: 'must be object',
            };
            if (vErrors === null) {
              vErrors = [err22];
            } else {
              vErrors.push(err22);
            }
            errors++;
          }
          var _valid0 = _errs19 === errors;
          if (_valid0 && valid0) {
            valid0 = false;
            passing0 = [passing0, 5];
          } else {
            if (_valid0) {
              valid0 = true;
              passing0 = 5;
              if (props0 !== true) {
                props0 = props0 || {};
                props0.t = true;
                props0.lvl = true;
                props0.msg = true;
                props0.src = true;
              }
            }
            const _errs28 = errors;
            if (data && typeof data == 'object' && !Array.isArray(data)) {
              if (data.t === undefined) {
                const err23 = {
                  instancePath,
                  schemaPath: '#/$defs/ack/required',
                  keyword: 'required',
                  params: { missingProperty: 't' },
                  message: "must have required property '" + 't' + "'",
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
              if (data.r === undefined) {
                const err24 = {
                  instancePath,
                  schemaPath: '#/$defs/ack/required',
                  keyword: 'required',
                  params: { missingProperty: 'r' },
                  message: "must have required property '" + 'r' + "'",
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
              if (data.ok === undefined) {
                const err25 = {
                  instancePath,
                  schemaPath: '#/$defs/ack/required',
                  keyword: 'required',
                  params: { missingProperty: 'ok' },
                  message: "must have required property '" + 'ok' + "'",
                };
                if (vErrors === null) {
                  vErrors = [err25];
                } else {
                  vErrors.push(err25);
                }
                errors++;
              }
              if (data.t !== undefined) {
                if ('ack' !== data.t) {
                  const err26 = {
                    instancePath: instancePath + '/t',
                    schemaPath: '#/$defs/ack/properties/t/const',
                    keyword: 'const',
                    params: { allowedValue: 'ack' },
                    message: 'must be equal to constant',
                  };
                  if (vErrors === null) {
                    vErrors = [err26];
                  } else {
                    vErrors.push(err26);
                  }
                  errors++;
                }
              }
              if (data.r !== undefined) {
                let data11 = data.r;
                if (!(
                  typeof data11 == 'number' &&
                  !(data11 % 1) &&
                  !isNaN(data11) &&
                  isFinite(data11)
                )) {
                  const err27 = {
                    instancePath: instancePath + '/r',
                    schemaPath: '#/$defs/ack/properties/r/type',
                    keyword: 'type',
                    params: { type: 'integer' },
                    message: 'must be integer',
                  };
                  if (vErrors === null) {
                    vErrors = [err27];
                  } else {
                    vErrors.push(err27);
                  }
                  errors++;
                }
                if (typeof data11 == 'number' && isFinite(data11)) {
                  if (data11 > 65535 || isNaN(data11)) {
                    const err28 = {
                      instancePath: instancePath + '/r',
                      schemaPath: '#/$defs/ack/properties/r/maximum',
                      keyword: 'maximum',
                      params: { comparison: '<=', limit: 65535 },
                      message: 'must be <= 65535',
                    };
                    if (vErrors === null) {
                      vErrors = [err28];
                    } else {
                      vErrors.push(err28);
                    }
                    errors++;
                  }
                  if (data11 < 1 || isNaN(data11)) {
                    const err29 = {
                      instancePath: instancePath + '/r',
                      schemaPath: '#/$defs/ack/properties/r/minimum',
                      keyword: 'minimum',
                      params: { comparison: '>=', limit: 1 },
                      message: 'must be >= 1',
                    };
                    if (vErrors === null) {
                      vErrors = [err29];
                    } else {
                      vErrors.push(err29);
                    }
                    errors++;
                  }
                }
              }
              if (data.ok !== undefined) {
                if (typeof data.ok !== 'boolean') {
                  const err30 = {
                    instancePath: instancePath + '/ok',
                    schemaPath: '#/$defs/ack/properties/ok/type',
                    keyword: 'type',
                    params: { type: 'boolean' },
                    message: 'must be boolean',
                  };
                  if (vErrors === null) {
                    vErrors = [err30];
                  } else {
                    vErrors.push(err30);
                  }
                  errors++;
                }
              }
              if (data.err !== undefined) {
                let data13 = data.err;
                if (typeof data13 === 'string') {
                  if (func1(data13) > 48) {
                    const err31 = {
                      instancePath: instancePath + '/err',
                      schemaPath: '#/$defs/ack/properties/err/maxLength',
                      keyword: 'maxLength',
                      params: { limit: 48 },
                      message: 'must NOT have more than 48 characters',
                    };
                    if (vErrors === null) {
                      vErrors = [err31];
                    } else {
                      vErrors.push(err31);
                    }
                    errors++;
                  }
                } else {
                  const err32 = {
                    instancePath: instancePath + '/err',
                    schemaPath: '#/$defs/ack/properties/err/type',
                    keyword: 'type',
                    params: { type: 'string' },
                    message: 'must be string',
                  };
                  if (vErrors === null) {
                    vErrors = [err32];
                  } else {
                    vErrors.push(err32);
                  }
                  errors++;
                }
              }
            } else {
              const err33 = {
                instancePath,
                schemaPath: '#/$defs/ack/type',
                keyword: 'type',
                params: { type: 'object' },
                message: 'must be object',
              };
              if (vErrors === null) {
                vErrors = [err33];
              } else {
                vErrors.push(err33);
              }
              errors++;
            }
            var _valid0 = _errs28 === errors;
            if (_valid0 && valid0) {
              valid0 = false;
              passing0 = [passing0, 6];
            } else {
              if (_valid0) {
                valid0 = true;
                passing0 = 6;
                if (props0 !== true) {
                  props0 = props0 || {};
                  props0.t = true;
                  props0.r = true;
                  props0.ok = true;
                  props0.err = true;
                }
              }
              const _errs38 = errors;
              if (data && typeof data == 'object' && !Array.isArray(data)) {
                if (data.t === undefined) {
                  const err34 = {
                    instancePath,
                    schemaPath: '#/$defs/pong/required',
                    keyword: 'required',
                    params: { missingProperty: 't' },
                    message: "must have required property '" + 't' + "'",
                  };
                  if (vErrors === null) {
                    vErrors = [err34];
                  } else {
                    vErrors.push(err34);
                  }
                  errors++;
                }
                if (data.r === undefined) {
                  const err35 = {
                    instancePath,
                    schemaPath: '#/$defs/pong/required',
                    keyword: 'required',
                    params: { missingProperty: 'r' },
                    message: "must have required property '" + 'r' + "'",
                  };
                  if (vErrors === null) {
                    vErrors = [err35];
                  } else {
                    vErrors.push(err35);
                  }
                  errors++;
                }
                if (data.t !== undefined) {
                  if ('pong' !== data.t) {
                    const err36 = {
                      instancePath: instancePath + '/t',
                      schemaPath: '#/$defs/pong/properties/t/const',
                      keyword: 'const',
                      params: { allowedValue: 'pong' },
                      message: 'must be equal to constant',
                    };
                    if (vErrors === null) {
                      vErrors = [err36];
                    } else {
                      vErrors.push(err36);
                    }
                    errors++;
                  }
                }
                if (data.r !== undefined) {
                  let data15 = data.r;
                  if (!(
                    typeof data15 == 'number' &&
                    !(data15 % 1) &&
                    !isNaN(data15) &&
                    isFinite(data15)
                  )) {
                    const err37 = {
                      instancePath: instancePath + '/r',
                      schemaPath: '#/$defs/pong/properties/r/type',
                      keyword: 'type',
                      params: { type: 'integer' },
                      message: 'must be integer',
                    };
                    if (vErrors === null) {
                      vErrors = [err37];
                    } else {
                      vErrors.push(err37);
                    }
                    errors++;
                  }
                  if (typeof data15 == 'number' && isFinite(data15)) {
                    if (data15 > 65535 || isNaN(data15)) {
                      const err38 = {
                        instancePath: instancePath + '/r',
                        schemaPath: '#/$defs/pong/properties/r/maximum',
                        keyword: 'maximum',
                        params: { comparison: '<=', limit: 65535 },
                        message: 'must be <= 65535',
                      };
                      if (vErrors === null) {
                        vErrors = [err38];
                      } else {
                        vErrors.push(err38);
                      }
                      errors++;
                    }
                    if (data15 < 1 || isNaN(data15)) {
                      const err39 = {
                        instancePath: instancePath + '/r',
                        schemaPath: '#/$defs/pong/properties/r/minimum',
                        keyword: 'minimum',
                        params: { comparison: '>=', limit: 1 },
                        message: 'must be >= 1',
                      };
                      if (vErrors === null) {
                        vErrors = [err39];
                      } else {
                        vErrors.push(err39);
                      }
                      errors++;
                    }
                  }
                }
              } else {
                const err40 = {
                  instancePath,
                  schemaPath: '#/$defs/pong/type',
                  keyword: 'type',
                  params: { type: 'object' },
                  message: 'must be object',
                };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
              var _valid0 = _errs38 === errors;
              if (_valid0 && valid0) {
                valid0 = false;
                passing0 = [passing0, 7];
              } else {
                if (_valid0) {
                  valid0 = true;
                  passing0 = 7;
                  if (props0 !== true) {
                    props0 = props0 || {};
                    props0.t = true;
                    props0.r = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err41 = {
      instancePath,
      schemaPath: '#/oneOf',
      keyword: 'oneOf',
      params: { passingSchemas: passing0 },
      message: 'must match exactly one schema in oneOf',
    };
    if (vErrors === null) {
      vErrors = [err41];
    } else {
      vErrors.push(err41);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate20.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate20.evaluated = { dynamicProps: true, dynamicItems: false };
export const validateAppToDevice = validate145;
const schema151 = {
  $id: 'https://schema.serialdash.dev/v1/app-to-device.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'SerialDash protocol v1 — app to device',
  description:
    'Validates the JSON payload of an app→device protocol line (SPEC.md §3.4). Messages MUST be flat objects (no nested object/array values) so a microcontroller can use a minimal streaming parser. PRT-40 additionally requires field order t, r, id, v on the wire; JSON Schema validates structure, not key order, so that rule is enforced by the encoder (app/src/protocol), not by this schema.',
  $defs: {
    flatExtra: {
      description:
        'Unknown fields in a known message MUST be ignored (PRT-06), so they remain allowed here — but every app→device message MUST be a flat object (§3.4), so an unknown field may not itself be an object or array.',
      not: { type: ['object', 'array'] },
    },
    hi: {
      type: 'object',
      properties: { t: { const: 'hi' }, v: { type: 'integer', const: 1 } },
      required: ['t', 'v'],
      additionalProperties: { $ref: '#/$defs/flatExtra' },
    },
    c: {
      type: 'object',
      properties: {
        t: { const: 'c' },
        r: { type: 'integer', minimum: 1, maximum: 65535 },
        id: { $ref: 'widgets/common.schema.json#/$defs/identifier' },
        v: {
          description: 'Type depends on the control (§4.3): number, boolean or string.',
          oneOf: [{ type: 'number' }, { type: 'boolean' }, { type: 'string' }],
        },
      },
      required: ['t', 'r', 'id', 'v'],
      additionalProperties: { $ref: '#/$defs/flatExtra' },
    },
    ping: {
      type: 'object',
      properties: { t: { const: 'ping' }, r: { type: 'integer', minimum: 1, maximum: 65535 } },
      required: ['t', 'r'],
      additionalProperties: { $ref: '#/$defs/flatExtra' },
    },
  },
  oneOf: [{ $ref: '#/$defs/hi' }, { $ref: '#/$defs/c' }, { $ref: '#/$defs/ping' }],
};
const schema152 = {
  type: 'object',
  properties: { t: { const: 'hi' }, v: { type: 'integer', const: 1 } },
  required: ['t', 'v'],
  additionalProperties: { $ref: '#/$defs/flatExtra' },
};
const schema153 = {
  description:
    'Unknown fields in a known message MUST be ignored (PRT-06), so they remain allowed here — but every app→device message MUST be a flat object (§3.4), so an unknown field may not itself be an object or array.',
  not: { type: ['object', 'array'] },
};
function validate146(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate146.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.v === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'v' },
        message: "must have required property '" + 'v' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === 't' || key0 === 'v')) {
        let data0 = data[key0];
        const _errs4 = errors;
        const _errs5 = errors;
        if (!data0 || typeof data0 != 'object') {
          const err2 = {};
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        var valid2 = _errs5 === errors;
        if (valid2) {
          const err3 = {
            instancePath: instancePath + '/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
            schemaPath: '#/$defs/flatExtra/not',
            keyword: 'not',
            params: {},
            message: 'must NOT be valid',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        } else {
          errors = _errs4;
          if (vErrors !== null) {
            if (_errs4) {
              vErrors.length = _errs4;
            } else {
              vErrors = null;
            }
          }
        }
      }
    }
    if (data.t !== undefined) {
      if ('hi' !== data.t) {
        const err4 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'hi' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.v !== undefined) {
      let data2 = data.v;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
        const err5 = {
          instancePath: instancePath + '/v',
          schemaPath: '#/properties/v/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (1 !== data2) {
        const err6 = {
          instancePath: instancePath + '/v',
          schemaPath: '#/properties/v/const',
          keyword: 'const',
          params: { allowedValue: 1 },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
  } else {
    const err7 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err7];
    } else {
      vErrors.push(err7);
    }
    errors++;
  }
  validate146.errors = vErrors;
  return errors === 0;
}
validate146.evaluated = { props: true, dynamicProps: false, dynamicItems: false };
const schema154 = {
  type: 'object',
  properties: {
    t: { const: 'c' },
    r: { type: 'integer', minimum: 1, maximum: 65535 },
    id: { $ref: 'widgets/common.schema.json#/$defs/identifier' },
    v: {
      description: 'Type depends on the control (§4.3): number, boolean or string.',
      oneOf: [{ type: 'number' }, { type: 'boolean' }, { type: 'string' }],
    },
  },
  required: ['t', 'r', 'id', 'v'],
  additionalProperties: { $ref: '#/$defs/flatExtra' },
};
function validate148(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate148.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.r === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'r' },
        message: "must have required property '" + 'r' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.id === undefined) {
      const err2 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'id' },
        message: "must have required property '" + 'id' + "'",
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.v === undefined) {
      const err3 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'v' },
        message: "must have required property '" + 'v' + "'",
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === 't' || key0 === 'r' || key0 === 'id' || key0 === 'v')) {
        let data0 = data[key0];
        const _errs4 = errors;
        const _errs5 = errors;
        if (!data0 || typeof data0 != 'object') {
          const err4 = {};
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        var valid2 = _errs5 === errors;
        if (valid2) {
          const err5 = {
            instancePath: instancePath + '/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
            schemaPath: '#/$defs/flatExtra/not',
            keyword: 'not',
            params: {},
            message: 'must NOT be valid',
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        } else {
          errors = _errs4;
          if (vErrors !== null) {
            if (_errs4) {
              vErrors.length = _errs4;
            } else {
              vErrors = null;
            }
          }
        }
      }
    }
    if (data.t !== undefined) {
      if ('c' !== data.t) {
        const err6 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'c' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.r !== undefined) {
      let data2 = data.r;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
        const err7 = {
          instancePath: instancePath + '/r',
          schemaPath: '#/properties/r/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      if (typeof data2 == 'number' && isFinite(data2)) {
        if (data2 > 65535 || isNaN(data2)) {
          const err8 = {
            instancePath: instancePath + '/r',
            schemaPath: '#/properties/r/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 65535 },
            message: 'must be <= 65535',
          };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (data2 < 1 || isNaN(data2)) {
          const err9 = {
            instancePath: instancePath + '/r',
            schemaPath: '#/properties/r/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      }
    }
    if (data.id !== undefined) {
      let data3 = data.id;
      if (typeof data3 === 'string') {
        if (!pattern4.test(data3)) {
          const err10 = {
            instancePath: instancePath + '/id',
            schemaPath: 'widgets/common.schema.json#/$defs/identifier/pattern',
            keyword: 'pattern',
            params: { pattern: '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' },
            message: 'must match pattern "' + '^[A-Za-z_][A-Za-z0-9_.-]{0,15}$' + '"',
          };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = {
          instancePath: instancePath + '/id',
          schemaPath: 'widgets/common.schema.json#/$defs/identifier/type',
          keyword: 'type',
          params: { type: 'string' },
          message: 'must be string',
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.v !== undefined) {
      let data4 = data.v;
      const _errs14 = errors;
      let valid5 = false;
      let passing0 = null;
      const _errs15 = errors;
      if (!(typeof data4 == 'number' && isFinite(data4))) {
        const err12 = {
          instancePath: instancePath + '/v',
          schemaPath: '#/properties/v/oneOf/0/type',
          keyword: 'type',
          params: { type: 'number' },
          message: 'must be number',
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      var _valid0 = _errs15 === errors;
      if (_valid0) {
        valid5 = true;
        passing0 = 0;
      }
      const _errs17 = errors;
      if (typeof data4 !== 'boolean') {
        const err13 = {
          instancePath: instancePath + '/v',
          schemaPath: '#/properties/v/oneOf/1/type',
          keyword: 'type',
          params: { type: 'boolean' },
          message: 'must be boolean',
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid0 = _errs17 === errors;
      if (_valid0 && valid5) {
        valid5 = false;
        passing0 = [passing0, 1];
      } else {
        if (_valid0) {
          valid5 = true;
          passing0 = 1;
        }
        const _errs19 = errors;
        if (typeof data4 !== 'string') {
          const err14 = {
            instancePath: instancePath + '/v',
            schemaPath: '#/properties/v/oneOf/2/type',
            keyword: 'type',
            params: { type: 'string' },
            message: 'must be string',
          };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        var _valid0 = _errs19 === errors;
        if (_valid0 && valid5) {
          valid5 = false;
          passing0 = [passing0, 2];
        } else {
          if (_valid0) {
            valid5 = true;
            passing0 = 2;
          }
        }
      }
      if (!valid5) {
        const err15 = {
          instancePath: instancePath + '/v',
          schemaPath: '#/properties/v/oneOf',
          keyword: 'oneOf',
          params: { passingSchemas: passing0 },
          message: 'must match exactly one schema in oneOf',
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      } else {
        errors = _errs14;
        if (vErrors !== null) {
          if (_errs14) {
            vErrors.length = _errs14;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err16 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate148.errors = vErrors;
  return errors === 0;
}
validate148.evaluated = { props: true, dynamicProps: false, dynamicItems: false };
const schema157 = {
  type: 'object',
  properties: { t: { const: 'ping' }, r: { type: 'integer', minimum: 1, maximum: 65535 } },
  required: ['t', 'r'],
  additionalProperties: { $ref: '#/$defs/flatExtra' },
};
function validate150(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate150.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  if (data && typeof data == 'object' && !Array.isArray(data)) {
    if (data.t === undefined) {
      const err0 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 't' },
        message: "must have required property '" + 't' + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.r === undefined) {
      const err1 = {
        instancePath,
        schemaPath: '#/required',
        keyword: 'required',
        params: { missingProperty: 'r' },
        message: "must have required property '" + 'r' + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!(key0 === 't' || key0 === 'r')) {
        let data0 = data[key0];
        const _errs4 = errors;
        const _errs5 = errors;
        if (!data0 || typeof data0 != 'object') {
          const err2 = {};
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        var valid2 = _errs5 === errors;
        if (valid2) {
          const err3 = {
            instancePath: instancePath + '/' + key0.replace(/~/g, '~0').replace(/\//g, '~1'),
            schemaPath: '#/$defs/flatExtra/not',
            keyword: 'not',
            params: {},
            message: 'must NOT be valid',
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        } else {
          errors = _errs4;
          if (vErrors !== null) {
            if (_errs4) {
              vErrors.length = _errs4;
            } else {
              vErrors = null;
            }
          }
        }
      }
    }
    if (data.t !== undefined) {
      if ('ping' !== data.t) {
        const err4 = {
          instancePath: instancePath + '/t',
          schemaPath: '#/properties/t/const',
          keyword: 'const',
          params: { allowedValue: 'ping' },
          message: 'must be equal to constant',
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.r !== undefined) {
      let data2 = data.r;
      if (!(typeof data2 == 'number' && !(data2 % 1) && !isNaN(data2) && isFinite(data2))) {
        const err5 = {
          instancePath: instancePath + '/r',
          schemaPath: '#/properties/r/type',
          keyword: 'type',
          params: { type: 'integer' },
          message: 'must be integer',
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (typeof data2 == 'number' && isFinite(data2)) {
        if (data2 > 65535 || isNaN(data2)) {
          const err6 = {
            instancePath: instancePath + '/r',
            schemaPath: '#/properties/r/maximum',
            keyword: 'maximum',
            params: { comparison: '<=', limit: 65535 },
            message: 'must be <= 65535',
          };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (data2 < 1 || isNaN(data2)) {
          const err7 = {
            instancePath: instancePath + '/r',
            schemaPath: '#/properties/r/minimum',
            keyword: 'minimum',
            params: { comparison: '>=', limit: 1 },
            message: 'must be >= 1',
          };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      }
    }
  } else {
    const err8 = {
      instancePath,
      schemaPath: '#/type',
      keyword: 'type',
      params: { type: 'object' },
      message: 'must be object',
    };
    if (vErrors === null) {
      vErrors = [err8];
    } else {
      vErrors.push(err8);
    }
    errors++;
  }
  validate150.errors = vErrors;
  return errors === 0;
}
validate150.evaluated = { props: true, dynamicProps: false, dynamicItems: false };
function validate145(
  data,
  { instancePath = '', parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {},
) {
  /*# sourceURL="https://schema.serialdash.dev/v1/app-to-device.schema.json" */ let vErrors = null;
  let errors = 0;
  const evaluated0 = validate145.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = undefined;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = undefined;
  }
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (
    !validate146(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate146.errors : vErrors.concat(validate146.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
    var props0 = true;
  }
  const _errs2 = errors;
  if (
    !validate148(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
  ) {
    vErrors = vErrors === null ? validate148.errors : vErrors.concat(validate148.errors);
    errors = vErrors.length;
  }
  var _valid0 = _errs2 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
      if (props0 !== true) {
        props0 = true;
      }
    }
    const _errs3 = errors;
    if (
      !validate150(data, { instancePath, parentData, parentDataProperty, rootData, dynamicAnchors })
    ) {
      vErrors = vErrors === null ? validate150.errors : vErrors.concat(validate150.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else {
      if (_valid0) {
        valid0 = true;
        passing0 = 2;
        if (props0 !== true) {
          props0 = true;
        }
      }
    }
  }
  if (!valid0) {
    const err0 = {
      instancePath,
      schemaPath: '#/oneOf',
      keyword: 'oneOf',
      params: { passingSchemas: passing0 },
      message: 'must match exactly one schema in oneOf',
    };
    if (vErrors === null) {
      vErrors = [err0];
    } else {
      vErrors.push(err0);
    }
    errors++;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0;
      } else {
        vErrors = null;
      }
    }
  }
  validate145.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate145.evaluated = { dynamicProps: true, dynamicItems: false };
