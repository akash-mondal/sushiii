package com.sushiii.l0

import cats.effect.{IO, Resource}
import com.sushiii.shared_data.CalculatedState
import org.tessellation.currency.l0.CurrencyL0App
import org.tessellation.schema.balance.Balance

object Main extends CurrencyL0App[IO, CalculatedState] {

  override def dataApplication: Option[Resource[IO, BaseDataApplicationL0Service[IO]]] = None

  override def genesis: (CalculatedState, Map[Address, Balance]) =
    (CalculatedState.empty, Map.empty)
}
