"""Encrypted, append-only data layer for Globis Edge.

The data layer is the foundation: every other layer writes through it.
It has zero upward imports — `models/`, `capabilities/`, and `api/` are
forbidden as dependencies. The dependency arrow is strictly:

    config → store → models → capabilities → api
"""
