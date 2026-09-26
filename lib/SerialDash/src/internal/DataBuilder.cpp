#include "DataBuilder.h"

namespace serialdash {

DataBuilder::~DataBuilder() {
  if (_out == nullptr) return;  // moved-from
  if (_mapOpen) _out->print('}');
  if (_dOpen) _out->print('}');
  if (_hasTs) {
    _out->print(F(",\"ts\":"));
    internal::writeUInt(*_out, _pendingTs);
  }
  _out->print(F("}\n"));
}

}  // namespace serialdash
