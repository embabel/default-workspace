# Types

Dynamic type schemas that define data structures the assistant understands. All `.yml` files in this directory are loaded. Each file contains a list of type definitions with named properties.

Types are used as inputs and outputs for actions, and are automatically inferred for webhook payloads.

```yml
- name: OrderEvent
  description: An incoming order from the e-commerce system
  properties:
    orderId: The unique order identifier
    customerName: Name of the customer
    total: Order total amount
```
