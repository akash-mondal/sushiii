package com.sushiii.data_l1

import cats.effect.{IO, Resource}
import cats.syntax.all._
import com.sushiii.shared_data.CalculatedState
import com.sushiii.shared_data.types.{ConsentEvent, PolicyVersion}
import com.sushiii.shared_data.validations.{ConsentEventValidator, PolicyVersionValidator}
import io.circe.syntax._
import org.http4s._
import org.http4s.circe._
import org.http4s.dsl.io._
import org.tessellation.currency.dataApplication.{BaseDataApplicationL1Service, DataApplicationValidationError}
import org.tessellation.currency.l1.CurrencyL1App
import org.tessellation.schema.SnapshotOrdinal
import org.tessellation.security.signature.Signed

object Main extends CurrencyL1App[IO, CalculatedState] {

  override def dataApplication: Option[Resource[IO, BaseDataApplicationL1Service[IO]]] =
    Some(DataApplicationL1Service.make[IO].map { service =>
      new BaseDataApplicationL1Service[IO] {
        override def validateUpdate(update: Signed[Update]): IO[Either[DataApplicationValidationError, Unit]] = {
          service.validateUpdate(update)
        }

        override def validateData(data: DataUpdate): IO[Either[DataApplicationValidationError, Unit]] = {
          service.validateData(data)
        }

        override def combine(
            currentState: CalculatedState,
            updates: List[Signed[Update]]
        ): IO[CalculatedState] = {
          service.combine(currentState, updates)
        }

        override def serializeState(state: CalculatedState): IO[Array[Byte]] = {
          service.serializeState(state)
        }

        override def deserializeState(bytes: Array[Byte]): IO[Either[Throwable, CalculatedState]] = {
          service.deserializeState(bytes)
        }

        override def serializeUpdate(update: Update): IO[Array[Byte]] = {
          service.serializeUpdate(update)
        }

        override def deserializeUpdate(bytes: Array[Byte]): IO[Either[Throwable, Update]] = {
          service.deserializeUpdate(bytes)
        }

        override def serializeBlock(block: Block): IO[Array[Byte]] = {
          service.serializeBlock(block)
        }

        override def deserializeBlock(bytes: Array[Byte]): IO[Either[Throwable, Block]] = {
          service.deserializeBlock(bytes)
        }

        override def dataEncoder: EntityEncoder[IO, DataUpdate] = service.dataEncoder

        override def dataDecoder: EntityDecoder[IO, DataUpdate] = service.dataDecoder

        override def calculatedStateEncoder: EntityEncoder[IO, CalculatedState] =
          service.calculatedStateEncoder

        override def calculatedStateDecoder: EntityDecoder[IO, CalculatedState] =
          service.calculatedStateDecoder

        override def routes: HttpRoutes[IO] = service.routes
      }
    })

  override def genesis: CalculatedState = CalculatedState.empty
}
