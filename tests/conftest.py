"""Windows compatibility for genlayer-test Direct Mode.

genlayer-test 0.29.2 deletes its temporary stdin file while the duplicated
stdin descriptor is still open. Windows rejects that unlink with WinError 32.
An anonymous pipe provides the same import-time calldata without filesystem
cleanup and keeps the test harness behavior unchanged.
"""

from __future__ import annotations

import os


def _inject_message_via_pipe(vm: object) -> None:
    from genlayer.py import calldata
    from genlayer.py.types import Address

    sender_addr = vm.sender
    if isinstance(sender_addr, bytes):
        sender_addr = Address(sender_addr)
    contract_addr = vm._contract_address
    if isinstance(contract_addr, bytes):
        contract_addr = Address(contract_addr)
    origin_addr = vm.origin
    if isinstance(origin_addr, bytes):
        origin_addr = Address(origin_addr)

    message_data = {
        "contract_address": contract_addr,
        "sender_address": sender_addr,
        "origin_address": origin_addr,
        "stack": [],
        "value": vm._value,
        "datetime": vm._datetime,
        "is_init": False,
        "chain_id": vm._chain_id,
        "entry_kind": 0,
        "entry_data": b"",
        "entry_stage_data": None,
    }
    encoded = calldata.encode(message_data)
    read_fd, write_fd = os.pipe()
    try:
        os.write(write_fd, encoded)
    finally:
        os.close(write_fd)

    vm._original_stdin_fd = os.dup(0)
    os.dup2(read_fd, 0)
    os.close(read_fd)


def pytest_configure() -> None:
    from gltest.direct import loader

    loader._inject_message_to_fd0 = _inject_message_via_pipe
